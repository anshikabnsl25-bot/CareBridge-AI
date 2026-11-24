from fastapi import APIRouter
from app.schemas.dto import AssistantMessage

router = APIRouter(prefix="/assistant", tags=["Multilingual Healthcare Assistant"])

# Approved factual healthcare knowledge base
KNOWLEDGE_BASE = {
    "en": {
        "opd": "OPD General Medicine is located on Floor 1 (Rooms 101-104). Timings: 9:00 AM to 3:00 PM Monday through Saturday.",
        "cardiology": "The Department of Cardiology is on Floor 2, Suite 201. Services include ECG, echocardiography, and specialist doctor consultation.",
        "pharmacy": "Jan Aushadhi Central Pharmacy is on Ground Floor near Gate A. Authentic medicines are provided at subsidized government rates.",
        "verification": "To verify medicine authenticity: Click 'Verify Medicine', scan the QR code on the packaging or type the batch/serial number. The system verifies regulatory registration and alerts if the batch is expired or repeatedly scanned.",
        "referral": "Rural clinical tele-referrals are submitted by certified ASHA workers from Primary Healthcare Centres (PHCs) to hospital specialists. Track progress under the 'Tele-Referrals' tab.",
        "queue": "Digital tokens display your live queue position and estimated waiting time. Please proceed to the waiting lounge when your token is within 2 positions of being served.",
        "emergency": "For chest pain, severe breathlessness, unconsciousness or heavy trauma, proceed immediately to the Ground Floor Emergency Hall or dial emergency line 108 without delay."
    },
    "hi": {
        "opd": "सामान्य चिकित्सा ओपीडी प्रथम तल (कमरा 101-104) पर स्थित है। समय: सोमवार से शनिवार सुबह 9:00 बजे से दोपहर 3:00 बजे तक।",
        "cardiology": "हृदय रोग विभाग (कार्डियोलॉजी) द्वितीय तल, कक्ष 201 पर स्थित है। यहाँ ईसीजी और विशेषज्ञ डॉक्टर परामर्श उपलब्ध है।",
        "pharmacy": "जन औषधि केंद्र भूतल पर गेट A के पास स्थित है। यहाँ सरकारी रियायती दरों पर दवाइयाँ उपलब्ध हैं।",
        "verification": "दवा सत्यापन के लिए: 'सत्यापन' टैब खोलें और दवा के पैकेट पर बने क्यूआर कोड को स्कैन करें। प्रणाली दवा की वैधता, निर्माण व एक्सपायरी तिथि जांचकर तुरंत परिणाम देती है।",
        "referral": "ग्रामीण टेली-रेफरल आशा कार्यकर्ताओं द्वारा प्राथमिक स्वास्थ्य केंद्रों से सीधे विशेषज्ञ डॉक्टरों को भेजे जाते हैं। स्थिति 'रेफरल ट्रैकिंग' में देखी जा सकती है।",
        "queue": "डिजिटल टोकन आपके कतार की वर्तमान स्थिति और अनुमानित प्रतीक्षा समय दिखाता है। अपनी बारी आने पर संबंधित परामर्श कक्ष में जाएं।",
        "emergency": "सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ या बेहोशी की स्थिति में सीधे भूतल पर आपातकालीन वार्ड में जाएं या 108 पर संपर्क करें।"
    }
}

@router.post("/query")
def consult_assistant(req: AssistantMessage):
    lang = "hi" if req.language in ["hi", "hindi"] else "en"
    text = req.message.lower()

    kb = KNOWLEDGE_BASE[lang]
    answer = None

    if any(k in text for k in ["emergen", "chest pain", "आपात", "सीने में दर्द", "दम"]):
        answer = kb["emergency"]
    elif any(k in text for k in ["cardio", "heart", "दिल", "हृदय"]):
        answer = kb["cardiology"]
    elif any(k in text for k in ["opd", "doctor", "consult", "डॉक्टर", "ओपीडी"]):
        answer = kb["opd"]
    elif any(k in text for k in ["medicine", "pharmacy", "दवा", "औषधि", "jan aushadhi"]):
        answer = kb["pharmacy"]
    elif any(k in text for k in ["verify", "qr", "fake", "counterfeit", "एक्सपायरी", "सत्यापन", "नकली"]):
        answer = kb["verification"]
    elif any(k in text for k in ["referral", "asha", "आशा", "रेफर"]):
        answer = kb["referral"]
    elif any(k in text for k in ["queue", "token", "wait", "लाइन", "टोकन", "प्रतीक्षा"]):
        answer = kb["queue"]
    else:
        if lang == "hi":
            answer = (
                "नमस्ते! मैं केयरब्रिज एआई स्वास्थ्य सहायक हूँ। "
                "मैं अस्पताल विभागों, कतार की स्थिति, दवा सत्यापन और डॉक्टर अपॉइंटमेंट में आपकी सहायता कर सकता हूँ। "
                "कृपया ध्यान दें: मैं चिकित्सीय निदान या पर्ची प्रदान नहीं करता हूँ।"
            )
        else:
            answer = (
                "Hello! I am the CareBridge AI Healthcare Navigator. "
                "I can guide you regarding hospital departments, OPD timings, live queue status, medicine verification, and specialist referral procedures. "
                "Note: I cannot diagnose conditions or prescribe medications."
            )

    disclaimer = (
        "अस्वीकरण: यह सहायक केवल अस्पताल नेविगेशन और प्रक्रियात्मक जानकारी हेतु है।"
        if lang == "hi" else
        "Disclaimer: This assistant provides facility guidance and cannot replace licensed clinical consultation."
    )

    return {
        "reply": answer,
        "language": lang,
        "disclaimer": disclaimer,
        "suggested_topics": [
            "OPD Timings" if lang == "en" else "ओपीडी समय",
            "Verify Medicine" if lang == "en" else "दवा सत्यापन",
            "Queue Token Status" if lang == "en" else "टोकन स्थिति",
            "Emergency Care" if lang == "en" else "आपातकालीन सेवा"
        ]
    }

