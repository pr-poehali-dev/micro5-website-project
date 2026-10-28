import hmac
import json
import os
import secrets
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p13899255_micro5_website_proje')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
}
STATUS_TEXT = {
    'new': 'Принята, ожидает рассмотрения',
    'in_work': 'Взята в работу',
    'approved': 'Одобрена, ожидает подписания договора',
    'rejected': 'Отклонена',
}
DAILY_RATE = 0.0008


def resp(code, data):
    return {'statusCode': code, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def esc(v):
    return "'" + str(v if v is not None else '').replace("'", "''") + "'"


def handler(event: dict, context) -> dict:
    """CRM для сотрудников: вход по паролю, список заявок, карточка клиента, заметки, одобрение с выдачей займа и отклонение."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    headers = {k.lower(): v for k, v in (event.get('headers') or {}).items()}
    token = headers.get('x-auth-token', '')
    body = json.loads(event.get('body') or '{}') if event.get('httpMethod') == 'POST' else {}
    params = event.get('queryStringParameters') or {}
    action = body.get('action') or params.get('action', 'list')

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    if action == 'login':
        password = os.environ.get('CRM_PASSWORD', '')
        if not password or not hmac.compare_digest(str(body.get('password', '')), password):
            return resp(401, {'error': 'Неверный пароль'})
        new_token = secrets.token_hex(32)
        cur.execute(f"INSERT INTO {SCHEMA}.crm_sessions (token) VALUES ({esc(new_token)})")
        return resp(200, {'token': new_token})

    cur.execute(f"SELECT 1 FROM {SCHEMA}.crm_sessions WHERE token = {esc(token)} AND expires_at > NOW()")
    if not token or not cur.fetchone():
        return resp(401, {'error': 'Нужно войти в CRM'})

    if action == 'logout':
        cur.execute(f"DELETE FROM {SCHEMA}.crm_sessions WHERE token = {esc(token)}")
        return resp(200, {'success': True})

    if action == 'list':
        status = params.get('status', '')
        where = f"WHERE a.status = {esc(status)}" if status else ''
        cur.execute(f"""SELECT a.id, a.amount, a.days, a.status, a.status_text, a.created_at, c.full_name, c.phone
            FROM {SCHEMA}.applications a JOIN {SCHEMA}.clients c ON c.id = a.client_id {where}
            ORDER BY a.id DESC LIMIT 500""")
        items = [{'id': r[0], 'amount': r[1], 'days': r[2], 'status': r[3], 'statusText': r[4], 'createdAt': str(r[5])[:16], 'fullName': r[6], 'phone': r[7]} for r in cur.fetchall()]
        cur.execute(f"SELECT status, COUNT(*) FROM {SCHEMA}.applications GROUP BY status")
        counts = {r[0]: r[1] for r in cur.fetchall()}
        return resp(200, {'items': items, 'counts': counts})

    app_id = int(body.get('id') or params.get('id') or 0)

    if action == 'get':
        cur.execute(f"""SELECT a.id, a.amount, a.days, a.status, a.status_text, a.created_at, a.client_id,
            c.full_name, c.phone, c.email, c.birth_date, c.passport_series, c.passport_number, c.passport_date,
            c.passport_issuer, c.address, c.income, c.employment, c.card_last4, c.card_bank, c.docs_verified
            FROM {SCHEMA}.applications a JOIN {SCHEMA}.clients c ON c.id = a.client_id WHERE a.id = {app_id}""")
        r = cur.fetchone()
        if not r:
            return resp(404, {'error': 'Заявка не найдена'})
        keys = ['id', 'amount', 'days', 'status', 'statusText', 'createdAt', 'clientId', 'fullName', 'phone', 'email', 'birthDate', 'passportSeries', 'passportNumber', 'passportDate', 'passportIssuer', 'address', 'income', 'employment', 'cardLast4', 'cardBank', 'docsVerified']
        data = dict(zip(keys, r))
        data['createdAt'] = str(data['createdAt'])[:16]
        cur.execute(f"SELECT id, text, created_at FROM {SCHEMA}.application_notes WHERE application_id = {app_id} ORDER BY id DESC")
        data['notes'] = [{'id': n[0], 'text': n[1], 'createdAt': str(n[2])[:16]} for n in cur.fetchall()]
        cur.execute(f"SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM {SCHEMA}.loans WHERE client_id = {data['clientId']}")
        loans = cur.fetchone()
        cur.execute(f"SELECT kind, url FROM {SCHEMA}.client_documents WHERE client_id = {data['clientId']}")
        data['documents'] = {d[0]: d[1] for d in cur.fetchall()}
        data['loansCount'] = loans[0]
        data['loansSum'] = loans[1]
        return resp(200, data)

    if action == 'add_note':
        text = str(body.get('text', '')).strip()
        if not text:
            return resp(400, {'error': 'Пустая заметка'})
        cur.execute(f"INSERT INTO {SCHEMA}.application_notes (application_id, text) VALUES ({app_id}, {esc(text)})")
        return resp(200, {'success': True})

    if action in ('in_work', 'approve', 'reject'):
        cur.execute(f"SELECT client_id, amount, days, status FROM {SCHEMA}.applications WHERE id = {app_id}")
        a = cur.fetchone()
        if not a:
            return resp(404, {'error': 'Заявка не найдена'})
        if a[3] in ('approved', 'rejected'):
            return resp(400, {'error': 'По заявке уже принято решение'})
        new_status = {'in_work': 'in_work', 'approve': 'approved', 'reject': 'rejected'}[action]
        text = STATUS_TEXT[new_status]
        if new_status == 'rejected' and str(body.get('reason', '')).strip():
            text = 'Отклонена: ' + str(body['reason']).strip()
        if new_status == 'rejected':
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({a[0]}, {esc(text)})")
        cur.execute(f"UPDATE {SCHEMA}.applications SET status = {esc(new_status)}, status_text = {esc(text)} WHERE id = {app_id}")
        if new_status == 'approved':
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({a[0]}, 'Заявка одобрена. Подпишите договор, чтобы получить деньги.')")
            amount, days = a[1], a[2]
            return_amount = round(amount * (1 + DAILY_RATE * days))
            cur.execute(f"""INSERT INTO {SCHEMA}.loans (client_id, application_id, amount, return_amount, days, status, due_date)
                VALUES ({a[0]}, {app_id}, {amount}, {return_amount}, {days}, 'awaiting_sign', CURRENT_DATE + {int(days)})""")
            cur.execute(f"UPDATE {SCHEMA}.clients SET docs_verified = TRUE WHERE id = {a[0]}")
        return resp(200, {'success': True, 'status': new_status})

    return resp(400, {'error': 'Неизвестное действие'})
