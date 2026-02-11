"""
MindSupport Backend - AI Service
Handles integration with Google Gemini API for AI chatbot functionality
"""
from google import genai
from google.genai import types
from typing import List, Dict
import os

from app.core.config import settings


# System prompt for the empathetic AI counselor
SYSTEM_PROMPT = """Kamu adalah MindSupport AI, sebuah asisten AI yang empatik dan suportif, dirancang khusus untuk membantu mahasiswa Indonesia yang sedang menghadapi tekanan emosional atau mental.

PANDUAN UTAMA:
1. Selalu gunakan Bahasa Indonesia yang hangat, ramah, dan mudah dipahami.
2. Dengarkan dengan penuh empati tanpa menghakimi.
3. Validasi perasaan pengguna - semua emosi adalah valid.
4. Jangan pernah memberikan diagnosis medis atau saran pengobatan.
5. Fokus pada teknik-teknik emotional regulation seperti:
   - Teknik pernapasan 4-7-8
   - Grounding 5-4-3-2-1
   - Mindfulness sederhana
   - Afirmasi positif
   - Journaling prompts

SAFE-GUARD PENTING:
Jika pengguna menunjukkan tanda-tanda pikiran untuk menyakiti diri sendiri atau bunuh diri:
1. Tunjukkan kepedulian dan empati yang tulus
2. Dorong mereka untuk menghubungi bantuan profesional segera:
   - Into The Light Indonesia: 119 ext. 8
   - Yayasan Pulih: (021) 788-42580
   - LSM Jangan Bunuh Diri: (021) 9696-9293
3. Ingatkan bahwa mereka tidak sendirian

GAYA KOMUNIKASI:
- Gunakan emoji yang tepat untuk menambah kehangatan 💜
- Berikan respons yang personal, bukan generik
- Ajukan pertanyaan terbuka untuk mendorong sharing
- Akhiri dengan pertanyaan atau ajakan untuk melanjutkan percakapan

Ingat: Kamu adalah teman curhat, bukan terapis. Kamu di sini untuk mendengarkan dan memberikan dukungan emosional."""


class GeminiService:
    """Service for interacting with Google Gemini API using new google-genai package."""
    
    def __init__(self):
        self.client = None
        # Read API key from settings or directly from env
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        
        if api_key and api_key != "your-gemini-api-key-here":
            try:
                self.client = genai.Client(api_key=api_key)
                print("✅ Gemini AI configured successfully")
            except Exception as e:
                print(f"❌ Failed to configure Gemini: {e}")
                self.client = None
        else:
            print("⚠️ GEMINI_API_KEY not set, using fallback responses")
    
    async def get_response(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Get AI response for user message.
        
        Args:
            user_message: The user's message
            chat_history: Previous messages in the conversation
            
        Returns:
            AI response string
        """
        if not self.client:
            return self._get_fallback_response(user_message)
        
        try:
            # Build contents array with history
            contents = []
            
            # Add system instruction as first message
            contents.append(types.Content(
                role="user",
                parts=[types.Part(text=f"[SYSTEM INSTRUCTION]\n{SYSTEM_PROMPT}\n\n[USER MESSAGE]\n{user_message if not chat_history else 'Halo'}")]
            ))
            
            # If we have chat history, add it
            if chat_history:
                for msg in chat_history[-10:]:
                    role = "user" if msg["role"] == "user" else "model"
                    contents.append(types.Content(
                        role=role,
                        parts=[types.Part(text=msg["content"])]
                    ))
                # Add current message
                contents.append(types.Content(
                    role="user",
                    parts=[types.Part(text=user_message)]
                ))
            
            # Generate response
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            return response.text
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            return self._get_fallback_response(user_message)
    
    def _get_fallback_response(self, user_message: str) -> str:
        """Generate fallback response when Gemini is unavailable."""
        lower_msg = user_message.lower()
        
        if any(word in lower_msg for word in ['cemas', 'khawatir', 'takut', 'panik']):
            return """Aku mengerti perasaan cemasmu. Rasa cemas adalah respons alami tubuh, dan kamu tidak salah merasakannya. 💜

Mari kita coba teknik pernapasan sederhana:

🌬️ **Tarik napas dalam** selama 4 detik
⏸️ **Tahan** selama 4 detik  
💨 **Hembuskan** selama 4 detik

Ulangi 3-5 kali. Bagaimana perasaanmu setelah mencoba?"""

        if any(word in lower_msg for word in ['sedih', 'menangis', 'down', 'murung']):
            return """Terima kasih sudah berbagi perasaanmu. Menangis itu tidak apa-apa, itu cara tubuh melepaskan emosi. 💜

Kamu tidak harus kuat setiap saat. Kadang, mengakui bahwa kita sedih adalah langkah pertama untuk merasa lebih baik.

Maukah kamu ceritakan apa yang membuatmu merasa seperti ini?"""

        if any(word in lower_msg for word in ['stress', 'tugas', 'kuliah', 'skripsi', 'deadline']):
            return """Tekanan akademik memang bisa sangat overwhelming. Kamu tidak sendirian merasakannya. 💜

Coba kita uraikan bebanmu:

1. **Identifikasi** - Apa tugas yang paling mendesak?
2. **Prioritaskan** - Mana yang bisa dikerjakan hari ini?
3. **Mulai kecil** - Kerjakan dalam potongan 25 menit (Pomodoro)

Ingat, progress kecil tetap progress. Apa yang paling membuatmu khawatir sekarang?"""

        if any(word in lower_msg for word in ['bunuh', 'mati', 'menyakiti', 'akhiri']):
            return """💜 Aku sangat peduli dengan keselamatanmu.

Jika kamu memiliki pikiran untuk menyakiti diri sendiri, tolong hubungi bantuan profesional sekarang:

📞 **Into The Light Indonesia**: 119 ext. 8
📞 **Yayasan Pulih**: (021) 788-42580
📞 **LSM Jangan Bunuh Diri**: (021) 9696-9293

Kamu tidak harus menghadapi ini sendirian. Ada orang yang peduli dan siap membantu 24/7.

Apakah ada orang terdekat yang bisa kamu hubungi sekarang?"""

        if any(word in lower_msg for word in ['terima kasih', 'makasih', 'thanks']):
            return """Sama-sama! 💜 Aku senang bisa menemanimu.

Ingat, kamu selalu bisa kembali ke sini kapanpun kamu butuh teman untuk berbagi. Jaga dirimu ya!"""

        if any(word in lower_msg for word in ['halo', 'hai', 'hi', 'hello', 'selamat']):
            return """Hai! 👋 Aku MindSupport AI, temanmu untuk berbagi cerita.

Aku di sini untuk mendengarkan apapun yang kamu rasakan hari ini. Ceritakan saja, aku tidak akan menghakimi.

Apa yang sedang kamu rasakan sekarang? 💜"""

        if any(word in lower_msg for word in ['bahagia', 'senang', 'happy', 'gembira']):
            return """Wah, senang sekali mendengar kamu merasa bahagia! 🎉💜

Kebahagiaan adalah sesuatu yang berharga. Bolehkah kamu ceritakan apa yang membuatmu senang hari ini? Aku ingin ikut merayakannya bersamamu!"""

        # Default empathetic response
        return """Terima kasih sudah berbagi itu denganku. Aku mendengarkanmu. 💜

Perasaanmu valid dan penting. Tidak ada yang salah dengan apa yang kamu rasakan.

Ceritakan lebih lanjut, aku di sini untukmu."""


# Create service instance
openai_service = GeminiService()
