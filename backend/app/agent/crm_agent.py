import json
from openai import OpenAI
from ..config import Config
from .prompts import SYSTEM_PROMPT, VEHICLE_CONTEXT
from .functions import AGENT_FUNCTIONS, execute_function
from ..services.call_manager import CallManager


class CRMAgent:
    def __init__(self):
        self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
        self.conversations = {}

    def get_conversation(self, call_id):
        if call_id not in self.conversations:
            self.conversations[call_id] = [
                {"role": "system", "content": SYSTEM_PROMPT + "\n\n" + VEHICLE_CONTEXT}
            ]
        return self.conversations[call_id]

    def process_message(self, call_id, user_message, phone=None):
        conversation = self.get_conversation(call_id)
        conversation.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",  # Better quality for natural conversation
                messages=conversation,
                tools=AGENT_FUNCTIONS,
                tool_choice="auto",
                temperature=0.85,  # Higher for more natural variation
                max_tokens=300  # Keep responses concise
            )

            assistant_message = response.choices[0].message
            functions_called = []
            takeover_requested = False

            if assistant_message.tool_calls:
                tool_results = []
                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)

                    result = execute_function(function_name, arguments, call_id)
                    functions_called.append({
                        "name": function_name,
                        "arguments": arguments,
                        "result": result
                    })

                    if function_name == "request_human_takeover":
                        takeover_requested = True
                        CallManager.takeover(call_id, result.get("reason", "AI requested"))

                    tool_results.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "content": json.dumps(result)
                    })

                    CallManager.add_function_call(call_id, function_name)

                conversation.append(assistant_message)
                conversation.extend(tool_results)

                follow_up = self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=conversation,
                    temperature=0.85,
                    max_tokens=300
                )
                final_response = follow_up.choices[0].message.content
                conversation.append({"role": "assistant", "content": final_response})
            else:
                final_response = assistant_message.content
                conversation.append({"role": "assistant", "content": final_response})

            confidence = self._calculate_confidence(response, user_message)
            sentiment = self._analyze_sentiment(user_message)

            CallManager.update_confidence(call_id, confidence)
            CallManager.update_sentiment(call_id, sentiment)

            return {
                "response": final_response,
                "functions_called": functions_called,
                "confidence": confidence,
                "sentiment": sentiment,
                "takeover_requested": takeover_requested
            }

        except Exception as e:
            error_msg = f"I apologize, I'm having some technical difficulty. Let me connect you to our team. Error: {str(e)}"
            return {
                "response": error_msg,
                "functions_called": [],
                "confidence": 0.5,
                "sentiment": 0.0,
                "error": str(e)
            }

    def _calculate_confidence(self, response, user_message):
        confidence = 0.85
        # Hindi, English, and Marathi unclear phrases
        unclear_phrases = [
            "kya?", "samajh nahi", "phir se", "?", "huh", "what",
            # Marathi unclear
            "kay?", "samajla nahi", "parat sanga", "nahi kalala"
        ]
        if any(phrase in user_message.lower() for phrase in unclear_phrases):
            confidence -= 0.2

        if response.choices[0].message.tool_calls:
            confidence += 0.1

        return min(max(confidence, 0.3), 1.0)

    def _analyze_sentiment(self, message):
        # Hindi, English, and Marathi sentiment words
        negative_words = [
            "problem", "issue", "kharab", "bura", "complaint", "angry", "upset", "galat", "bekaar", "worst",
            # Marathi negative
            "vait", "trasadi", "problem", "kharab", "naraz", "dukh"
        ]
        positive_words = [
            "good", "great", "thanks", "dhanyavaad", "achha", "best", "happy", "excellent",
            # Marathi positive
            "mast", "chhan", "dhanyavaad", "khush", "uttam", "sundar", "barober"
        ]

        message_lower = message.lower()
        neg_count = sum(1 for word in negative_words if word in message_lower)
        pos_count = sum(1 for word in positive_words if word in message_lower)

        if neg_count > pos_count:
            return -0.5 * min(neg_count, 2)
        elif pos_count > neg_count:
            return 0.5 * min(pos_count, 2)
        return 0.0

    def get_greeting(self):
        # More natural, conversational greetings
        import random
        greetings = [
            "Hello! Satis Motor se Priya bol rahi hoon. Kaise help kar sakti hoon aapki?",
            "Haan ji, Satis Motor - Priya here! Bataiye kya kar sakti hoon aapke liye?",
            "Good morning! Satis Motor se baat ho rahi hai. Main Priya, bataiye?",
            "Hello ji! Satis Motor, Priya speaking. Kya help chahiye aapko?"
        ]
        return random.choice(greetings)

    def clear_conversation(self, call_id):
        if call_id in self.conversations:
            del self.conversations[call_id]


agent = CRMAgent()
