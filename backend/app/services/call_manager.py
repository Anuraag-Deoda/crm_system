from datetime import datetime
import os
from ..data.excel_handler import ExcelHandler, CALL_LOG_COLUMNS
from ..config import Config


class CallManager:
    active_calls = {}

    @staticmethod
    def start_call(phone, direction='inbound', call_type='inquiry', customer_name='Unknown'):
        call_id = ExcelHandler.generate_id('CALL')
        call = {
            'call_id': call_id,
            'customer_id': '',
            'customer_name': customer_name,
            'phone': phone,
            'direction': direction,
            'type': call_type,
            'start_time': datetime.now().isoformat(),
            'end_time': '',
            'duration_seconds': 0,
            'handled_by': 'ai',
            'takeover_reason': '',
            'outcome': '',
            'transcript_file': f"{call_id}.txt",
            'transcript': [],
            'sentiment_score': 0.0,
            'ai_confidence': 1.0,
            'notes': '',
            'status': 'active',
            'context': {
                'intent': '',
                'model_discussed': '',
                'functions_called': []
            }
        }
        CallManager.active_calls[call_id] = call
        return call

    @staticmethod
    def get_active_calls():
        return list(CallManager.active_calls.values())

    @staticmethod
    def get_call(call_id):
        return CallManager.active_calls.get(call_id)

    @staticmethod
    def add_message(call_id, role, content, timestamp=None):
        if call_id in CallManager.active_calls:
            if timestamp is None:
                call_start = datetime.fromisoformat(CallManager.active_calls[call_id]['start_time'])
                elapsed = (datetime.now() - call_start).total_seconds()
                mins = int(elapsed // 60)
                secs = int(elapsed % 60)
                timestamp = f"{mins:02d}:{secs:02d}"

            message = {
                'timestamp': timestamp,
                'role': role,
                'content': content
            }
            CallManager.active_calls[call_id]['transcript'].append(message)
            return message
        return None

    @staticmethod
    def update_context(call_id, context_updates):
        if call_id in CallManager.active_calls:
            CallManager.active_calls[call_id]['context'].update(context_updates)

    @staticmethod
    def add_function_call(call_id, function_name):
        if call_id in CallManager.active_calls:
            CallManager.active_calls[call_id]['context']['functions_called'].append(function_name)

    @staticmethod
    def update_sentiment(call_id, sentiment_score):
        if call_id in CallManager.active_calls:
            CallManager.active_calls[call_id]['sentiment_score'] = sentiment_score

    @staticmethod
    def update_confidence(call_id, confidence):
        if call_id in CallManager.active_calls:
            CallManager.active_calls[call_id]['ai_confidence'] = confidence

    @staticmethod
    def takeover(call_id, reason='manual'):
        if call_id in CallManager.active_calls:
            CallManager.active_calls[call_id]['handled_by'] = 'ai_then_human'
            CallManager.active_calls[call_id]['takeover_reason'] = reason
            CallManager.active_calls[call_id]['status'] = 'takeover'
            return True
        return False

    @staticmethod
    def end_call(call_id, outcome='resolved'):
        if call_id in CallManager.active_calls:
            call = CallManager.active_calls[call_id]
            call['end_time'] = datetime.now().isoformat()
            start = datetime.fromisoformat(call['start_time'])
            end = datetime.fromisoformat(call['end_time'])
            call['duration_seconds'] = int((end - start).total_seconds())
            call['outcome'] = outcome
            call['status'] = 'ended'

            CallManager._save_transcript(call)
            CallManager._save_call_log(call)

            del CallManager.active_calls[call_id]
            return call
        return None

    @staticmethod
    def _save_transcript(call):
        os.makedirs(Config.TRANSCRIPTS_DIR, exist_ok=True)
        filepath = os.path.join(Config.TRANSCRIPTS_DIR, call['transcript_file'])
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"Call ID: {call['call_id']}\n")
            f.write(f"Phone: {call['phone']}\n")
            f.write(f"Customer: {call['customer_name']}\n")
            f.write(f"Type: {call['type']}\n")
            f.write(f"Duration: {call['duration_seconds']} seconds\n")
            f.write(f"Outcome: {call['outcome']}\n")
            f.write("-" * 50 + "\n\n")

            for msg in call['transcript']:
                role_label = "AI" if msg['role'] == 'assistant' else "Customer"
                f.write(f"[{msg['timestamp']}] {role_label}: {msg['content']}\n\n")

    @staticmethod
    def _save_call_log(call):
        log_entry = {
            'call_id': call['call_id'],
            'customer_id': call['customer_id'],
            'customer_name': call['customer_name'],
            'phone': call['phone'],
            'direction': call['direction'],
            'type': call['type'],
            'start_time': call['start_time'],
            'end_time': call['end_time'],
            'duration_seconds': call['duration_seconds'],
            'handled_by': call['handled_by'],
            'takeover_reason': call['takeover_reason'],
            'outcome': call['outcome'],
            'transcript_file': call['transcript_file'],
            'sentiment_score': call['sentiment_score'],
            'ai_confidence': call['ai_confidence'],
            'notes': call['notes']
        }
        ExcelHandler.append_row(Config.CALL_LOGS_FILE, log_entry, CALL_LOG_COLUMNS)

    @staticmethod
    def get_call_logs():
        df = ExcelHandler.read_excel(Config.CALL_LOGS_FILE, CALL_LOG_COLUMNS)
        return df.to_dict('records')

    @staticmethod
    def get_call_log(call_id):
        return ExcelHandler.get_by_id(
            Config.CALL_LOGS_FILE, 'call_id', call_id, CALL_LOG_COLUMNS
        )

    @staticmethod
    def get_transcript(call_id):
        filepath = os.path.join(Config.TRANSCRIPTS_DIR, f"{call_id}.txt")
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        return None

    @staticmethod
    def get_stats():
        df = ExcelHandler.read_excel(Config.CALL_LOGS_FILE, CALL_LOG_COLUMNS)
        today = datetime.now().strftime('%Y-%m-%d')

        today_calls = df[df['start_time'].str.startswith(today, na=False)]

        return {
            'total_calls': len(df),
            'today_calls': len(today_calls),
            'active_calls': len(CallManager.active_calls),
            'ai_handled': len(df[df['handled_by'] == 'ai']),
            'human_takeover': len(df[df['handled_by'] == 'ai_then_human']),
            'avg_duration': df['duration_seconds'].mean() if len(df) > 0 else 0
        }
