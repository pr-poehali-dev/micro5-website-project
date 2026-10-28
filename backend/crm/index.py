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
    'need_docs': 'Нужны документы или уточнение данных',
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
        cur.execute(f"""SELECT a.id, a.amount, a.days, a.status, a.status_text, a.created_at, c.full_name, c.phone,
            c.phone_verified, a.data_confirm,
            (SELECT status FROM {SCHEMA}.video_checks v WHERE v.client_id = c.id ORDER BY v.id DESC LIMIT 1),
            (SELECT COUNT(*) FROM {SCHEMA}.client_documents d WHERE d.client_id = c.id),
            (SELECT COUNT(*) FROM {SCHEMA}.client_documents d WHERE d.client_id = c.id AND d.status = 'approved')
            FROM {SCHEMA}.applications a JOIN {SCHEMA}.clients c ON c.id = a.client_id {where}
            ORDER BY a.id DESC LIMIT 500""")
        items = [{'id': r[0], 'amount': r[1], 'days': r[2], 'status': r[3], 'statusText': r[4], 'createdAt': str(r[5])[:16], 'fullName': r[6], 'phone': r[7], 'phoneVerified': r[8], 'dataConfirm': r[9], 'videoStatus': r[10], 'docsCount': r[11], 'docsApproved': r[12]} for r in cur.fetchall()]
        cur.execute(f"SELECT status, COUNT(*) FROM {SCHEMA}.applications GROUP BY status")
        counts = {r[0]: r[1] for r in cur.fetchall()}
        return resp(200, {'items': items, 'counts': counts})

    app_id = int(body.get('id') or params.get('id') or 0)

    if action == 'get':
        cur.execute(f"""SELECT a.id, a.amount, a.days, a.status, a.status_text, a.created_at, a.client_id,
            c.full_name, c.phone, c.email, c.birth_date, c.passport_series, c.passport_number, c.passport_date,
            c.passport_issuer, c.address, c.income, c.employment, c.card_last4, c.card_bank, c.docs_verified, c.phone_verified, a.data_confirm, a.data_confirm_comment
            FROM {SCHEMA}.applications a JOIN {SCHEMA}.clients c ON c.id = a.client_id WHERE a.id = {app_id}""")
        r = cur.fetchone()
        if not r:
            return resp(404, {'error': 'Заявка не найдена'})
        keys = ['id', 'amount', 'days', 'status', 'statusText', 'createdAt', 'clientId', 'fullName', 'phone', 'email', 'birthDate', 'passportSeries', 'passportNumber', 'passportDate', 'passportIssuer', 'address', 'income', 'employment', 'cardLast4', 'cardBank', 'docsVerified', 'phoneVerified', 'dataConfirm', 'dataConfirmComment']
        data = dict(zip(keys, r))
        data['createdAt'] = str(data['createdAt'])[:16]
        cur.execute(f"SELECT id, text, created_at FROM {SCHEMA}.application_notes WHERE application_id = {app_id} ORDER BY id DESC")
        data['notes'] = [{'id': n[0], 'text': n[1], 'createdAt': str(n[2])[:16]} for n in cur.fetchall()]
        cur.execute(f"SELECT COUNT(*), COALESCE(SUM(amount), 0) FROM {SCHEMA}.loans WHERE client_id = {data['clientId']}")
        loans = cur.fetchone()
        cur.execute(f"SELECT kind, url, status, reject_reason FROM {SCHEMA}.client_documents WHERE client_id = {data['clientId']}")
        data['documents'] = {d[0]: {'url': d[1], 'status': d[2], 'reason': d[3]} for d in cur.fetchall()}
        cur.execute(f"SELECT id, url, auto_ok, auto_issues, status, reject_reason, created_at, code FROM {SCHEMA}.video_checks WHERE client_id = {data['clientId']} ORDER BY id DESC LIMIT 1")
        v = cur.fetchone()
        data['video'] = {'id': v[0], 'url': v[1], 'autoOk': v[2], 'autoIssues': v[3], 'status': v[4], 'reason': v[5], 'createdAt': str(v[6])[:16], 'code': v[7]} if v else None
        cur.execute(f"SELECT id, result, comment, created_at FROM {SCHEMA}.call_log WHERE application_id = {app_id} ORDER BY id DESC")
        data['calls'] = [{'id': c[0], 'result': c[1], 'comment': c[2], 'createdAt': str(c[3])[:16]} for c in cur.fetchall()]
        data['loansCount'] = loans[0]
        data['loansSum'] = loans[1]
        return resp(200, data)

    if action == 'add_note':
        text = str(body.get('text', '')).strip()
        if not text:
            return resp(400, {'error': 'Пустая заметка'})
        cur.execute(f"INSERT INTO {SCHEMA}.application_notes (application_id, text) VALUES ({app_id}, {esc(text)})")
        return resp(200, {'success': True})

    if action == 'video_review':
        cur.execute(f"SELECT client_id FROM {SCHEMA}.applications WHERE id = {app_id}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Заявка не найдена'})
        decision = body.get('decision')
        reason = str(body.get('reason', '')).strip()
        if decision not in ('approved', 'rejected'):
            return resp(400, {'error': 'Неверное решение'})
        cur.execute(f"UPDATE {SCHEMA}.video_checks SET status = {esc(decision)}, reject_reason = {esc(reason)}, checked_at = NOW() WHERE id = (SELECT MAX(id) FROM {SCHEMA}.video_checks WHERE client_id = {row[0]})")
        if decision == 'approved':
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({row[0]}, 'Видеоидентификация пройдена.')")
        else:
            note = 'Видео не принято, запишите его заново.' + (f' Причина: {reason}' if reason else '')
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({row[0]}, {esc(note)})")
        return resp(200, {'success': True})

    if action in ('doc_review', 'phone_verify', 'log_call', 'request_confirm'):
        cur.execute(f"SELECT client_id FROM {SCHEMA}.applications WHERE id = {app_id}")
        row = cur.fetchone()
        if not row:
            return resp(404, {'error': 'Заявка не найдена'})
        cid = row[0]
        if action == 'doc_review':
            kind = body.get('kind')
            decision = body.get('decision')
            reason = str(body.get('reason', '')).strip()
            if kind not in ('passport', 'selfie') or decision not in ('approved', 'rejected'):
                return resp(400, {'error': 'Неверные данные'})
            cur.execute(f"UPDATE {SCHEMA}.client_documents SET status = {esc(decision)}, reject_reason = {esc(reason)}, checked_at = NOW() WHERE client_id = {cid} AND kind = {esc(kind)}")
            names = {'passport': 'Фото паспорта', 'selfie': 'Селфи с паспортом'}
            if decision == 'rejected':
                note = f"{names[kind]} не принято. Загрузите фото заново." + (f" Причина: {reason}" if reason else '')
                cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({cid}, {esc(note)})")
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.client_documents WHERE client_id = {cid} AND status = 'approved'")
            cur.execute(f"UPDATE {SCHEMA}.clients SET docs_verified = {'TRUE' if cur.fetchone()[0] >= 2 else 'FALSE'} WHERE id = {cid}")
            return resp(200, {'success': True})
        if action == 'phone_verify':
            value = 'TRUE' if body.get('value') else 'FALSE'
            cur.execute(f"UPDATE {SCHEMA}.clients SET phone_verified = {value} WHERE id = {cid}")
            return resp(200, {'success': True})
        if action == 'log_call':
            result = body.get('result')
            if result not in ('reached', 'no_answer', 'wrong_number', 'callback'):
                return resp(400, {'error': 'Неверный результат звонка'})
            comment = str(body.get('comment', '')).strip()
            cur.execute(f"INSERT INTO {SCHEMA}.call_log (application_id, result, comment) VALUES ({app_id}, {esc(result)}, {esc(comment)})")
            if result == 'reached':
                cur.execute(f"UPDATE {SCHEMA}.clients SET phone_verified = TRUE WHERE id = {cid}")
            elif result == 'wrong_number':
                cur.execute(f"UPDATE {SCHEMA}.clients SET phone_verified = FALSE WHERE id = {cid}")
            return resp(200, {'success': True})
        cur.execute(f"UPDATE {SCHEMA}.applications SET data_confirm = 'requested', data_confirm_comment = '' WHERE id = {app_id}")
        cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({cid}, 'Подтвердите ваши данные в личном кабинете, чтобы мы продолжили рассмотрение заявки.')")
        return resp(200, {'success': True})

    if action in ('in_work', 'need_docs', 'approve', 'reject'):
        cur.execute(f"SELECT client_id, amount, days, status FROM {SCHEMA}.applications WHERE id = {app_id}")
        a = cur.fetchone()
        if not a:
            return resp(404, {'error': 'Заявка не найдена'})
        if a[3] in ('approved', 'rejected'):
            return resp(400, {'error': 'По заявке уже принято решение'})
        new_status = {'in_work': 'in_work', 'need_docs': 'need_docs', 'approve': 'approved', 'reject': 'rejected'}[action]
        text = STATUS_TEXT[new_status]
        if new_status == 'need_docs':
            if str(body.get('reason', '')).strip():
                text = 'Нужно уточнение: ' + str(body['reason']).strip()
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({a[0]}, {esc(text)})")
        if new_status == 'rejected' and str(body.get('reason', '')).strip():
            text = 'Отклонена: ' + str(body['reason']).strip()
        if new_status == 'rejected':
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({a[0]}, {esc(text)})")
        cur.execute(f"UPDATE {SCHEMA}.applications SET status = {esc(new_status)}, status_text = {esc(text)} WHERE id = {app_id}")
        if new_status == 'approved':
            cur.execute(f"INSERT INTO {SCHEMA}.notifications (client_id, text) VALUES ({a[0]}, 'Заявка одобрена. Подпишите договор, чтобы получить деньги.')")
            amount, days = a[1], a[2]
            cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.loans WHERE client_id = {a[0]}")
            return_amount = amount if cur.fetchone()[0] == 0 else round(amount * (1 + DAILY_RATE * days))
            cur.execute(f"""INSERT INTO {SCHEMA}.loans (client_id, application_id, amount, return_amount, days, status, due_date)
                VALUES ({a[0]}, {app_id}, {amount}, {return_amount}, {days}, 'awaiting_sign', CURRENT_DATE + {int(days)})""")
        return resp(200, {'success': True, 'status': new_status})

    return resp(400, {'error': 'Неизвестное действие'})
