import json
import os
import re
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p13899255_micro5_website_proje')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}


def resp(code, data):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def esc(v):
    return "'" + str(v if v is not None else '').replace("'", "''") + "'"


def norm_phone(p):
    d = re.sub(r'\D', '', p or '')
    if len(d) == 11 and d[0] in '78':
        d = d[1:]
    return d if len(d) == 10 else ''


def get_client(cur, token):
    if not token:
        return None
    cur.execute(f"SELECT c.id, c.phone FROM {SCHEMA}.sessions s JOIN {SCHEMA}.clients c ON c.id = s.client_id WHERE s.token = {esc(token)} AND s.expires_at > NOW()")
    return cur.fetchone()


def profile(cur, cid):
    cur.execute(f"SELECT phone, full_name, email, birth_date, passport_series, passport_number, passport_date, passport_issuer, address, income, employment, card_last4, card_bank, docs_verified FROM {SCHEMA}.clients WHERE id = {int(cid)}")
    r = cur.fetchone()
    keys = ['phone', 'fullName', 'email', 'birthDate', 'passportSeries', 'passportNumber', 'passportDate', 'passportIssuer', 'address', 'income', 'employment', 'cardLast4', 'cardBank', 'docsVerified']
    return dict(zip(keys, r))


def handler(event: dict, context) -> dict:
    """Личный кабинет клиента: вход по телефону, займы, договоры, заявки и анкета из базы данных."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token', '')
    body = json.loads(event.get('body') or '{}') if event.get('httpMethod') == 'POST' else {}
    action = body.get('action') or (event.get('queryStringParameters') or {}).get('action', 'me')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    if action == 'login':
        phone = norm_phone(body.get('phone'))
        if not phone:
            return resp(400, {'error': 'Неверный номер телефона'})
        cur.execute(f"SELECT id FROM {SCHEMA}.clients WHERE phone = {esc(phone)}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Клиент с таким номером не найден. Сначала оформите заявку.'})
        new_token = secrets.token_hex(32)
        cur.execute(f"INSERT INTO {SCHEMA}.sessions (token, client_id) VALUES ({esc(new_token)}, {row[0]})")
        return resp(200, {'token': new_token, 'phone': phone})

    if action == 'apply':
        phone = norm_phone(body.get('phone'))
        if not phone:
            return resp(400, {'error': 'Неверный номер телефона'})
        card = re.sub(r'\D', '', body.get('cardNumber') or '')[-4:]
        cur.execute(f"""INSERT INTO {SCHEMA}.clients (phone, full_name, email, birth_date, passport_series, passport_number, passport_date, passport_issuer, address, income, employment, card_last4, card_bank)
            VALUES ({esc(phone)}, {esc(body.get('fullName'))}, {esc(body.get('email'))}, {esc(body.get('birthDate'))}, {esc(body.get('passportSeries'))}, {esc(body.get('passportNumber'))}, {esc(body.get('passportDate'))}, {esc(body.get('passportIssuer'))}, {esc(body.get('address'))}, {esc(body.get('income'))}, {esc(body.get('employment'))}, {esc(card)}, {esc(body.get('cardBank'))})
            ON CONFLICT (phone) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, birth_date = EXCLUDED.birth_date, passport_series = EXCLUDED.passport_series, passport_number = EXCLUDED.passport_number, passport_date = EXCLUDED.passport_date, passport_issuer = EXCLUDED.passport_issuer, address = EXCLUDED.address, income = EXCLUDED.income, employment = EXCLUDED.employment, card_last4 = EXCLUDED.card_last4, card_bank = EXCLUDED.card_bank, updated_at = NOW()
            RETURNING id""")
        cid = cur.fetchone()[0]
        amount = int(body.get('loanAmount') or 0)
        days = int(body.get('loanDays') or 0)
        cur.execute(f"INSERT INTO {SCHEMA}.applications (client_id, amount, days) VALUES ({cid}, {amount}, {days}) RETURNING id")
        app_id = cur.fetchone()[0]
        return resp(200, {'success': True, 'applicationId': app_id})

    client = get_client(cur, token)
    if not client:
        return resp(401, {'error': 'Нужно войти в личный кабинет'})
    cid = client[0]

    if action == 'logout':
        cur.execute(f"DELETE FROM {SCHEMA}.sessions WHERE token = {esc(token)}")
        return resp(200, {'success': True})

    if action == 'update_profile':
        fields = {'fullName': 'full_name', 'email': 'email', 'birthDate': 'birth_date', 'address': 'address', 'income': 'income', 'employment': 'employment'}
        sets = [f"{col} = {esc(body[key])}" for key, col in fields.items() if key in body]
        if sets:
            cur.execute(f"UPDATE {SCHEMA}.clients SET {', '.join(sets)}, updated_at = NOW() WHERE id = {cid}")
        return resp(200, {'profile': profile(cur, cid)})

    if action in ('sign', 'payout'):
        loan_id = int(body.get('loanId') or 0)
        cur.execute(f"SELECT status, days FROM {SCHEMA}.loans WHERE id = {loan_id} AND client_id = {cid}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Займ не найден'})
        if action == 'sign':
            if row[0] != 'awaiting_sign':
                return resp(400, {'error': 'Договор уже подписан'})
            cur.execute(f"UPDATE {SCHEMA}.loans SET status = 'signed', signed_at = NOW() WHERE id = {loan_id}")
        else:
            if row[0] != 'signed':
                return resp(400, {'error': 'Сначала подпишите договор'})
            cur.execute(f"UPDATE {SCHEMA}.loans SET status = 'active', paid_out_at = NOW(), issued_at = CURRENT_DATE, due_date = CURRENT_DATE + {int(row[1])} WHERE id = {loan_id}")
        return resp(200, {'success': True})

    cur.execute(f"SELECT id, amount, return_amount, due_date, status, issued_at, days, GREATEST((due_date - CURRENT_DATE), 0), signed_at, paid_out_at FROM {SCHEMA}.loans WHERE client_id = {cid} ORDER BY id DESC")
    loans = [{'id': f'LOAN-{r[0]:03d}', 'dbId': r[0], 'amount': r[1], 'returnAmount': r[2], 'dueDate': str(r[3]), 'status': r[4], 'issuedAt': str(r[5]), 'days': r[6], 'daysLeft': r[7] if r[4] != 'awaiting_sign' and r[4] != 'signed' else r[6], 'signedAt': str(r[8])[:16] if r[8] else '', 'paidOutAt': str(r[9])[:16] if r[9] else ''} for r in cur.fetchall()]
    cur.execute(f"SELECT id, amount, created_at, status, status_text FROM {SCHEMA}.applications WHERE client_id = {cid} ORDER BY id DESC")
    apps = [{'id': f'APP-{r[0]:03d}', 'amount': r[1], 'date': str(r[2])[:10], 'status': r[3], 'statusText': r[4]} for r in cur.fetchall()]
    return resp(200, {'profile': profile(cur, cid), 'loans': loans, 'applications': apps})
