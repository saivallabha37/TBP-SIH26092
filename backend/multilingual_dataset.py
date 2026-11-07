
multilingual_examples = [
    # English
    {
        "message": "I want to start a tailoring business",
        "language": "english",
        "expected": "business",
    },
    {
        "message": "I need money for college fees",
        "language": "english",
        "expected": "education",
    },
    {
        "message": "I want to grow vegetables on my farm",
        "language": "english",
        "expected": "agriculture",
    },

    # Telugu
    {
        "message": "నేను టైలరింగ్ వ్యాపారం ప్రారంభించాలనుకుంటున్నాను",
        "language": "telugu",
        "expected": "business",
    },
    {
        "message": "నాకు కాలేజీ ఫీజుల కోసం డబ్బు కావాలి",
        "language": "telugu",
        "expected": "education",
    },
    {
        "message": "నేను వ్యవసాయం చేయాలనుకుంటున్నాను",
        "language": "telugu",
        "expected": "agriculture",
    },

    # Hindi
    {
        "message": "मैं सिलाई का व्यवसाय शुरू करना चाहता हूँ",
        "language": "hindi",
        "expected": "business",
    },
    {
        "message": "मुझे कॉलेज की फीस के लिए पैसे चाहिए",
        "language": "hindi",
        "expected": "education",
    },
    {
        "message": "मैं खेती करना चाहता हूँ",
        "language": "hindi",
        "expected": "agriculture",
    },
    
    # Unknown / unclear purpose

    {
        "message": "I need some financial help",
        "language": "english",
        "expected": "unknown",
    },
    {
        "message": "నాకు కొంత ఆర్థిక సహాయం కావాలి",
        "language": "telugu",
        "expected": "unknown",
    },
    {
        "message": "मुझे कुछ आर्थिक मदद चाहिए",
        "language": "hindi",
        "expected": "unknown",
    }, # Additional English business examples
    {"message": "I want to establish a small grocery store", "language": "english", "expected": "business"},
    {"message": "I need funding to expand my clothing shop", "language": "english", "expected": "business"},
    {"message": "I want to purchase machines for my workshop", "language": "english", "expected": "business"},
    {"message": "I plan to start a small food processing unit", "language": "english", "expected": "business"},
    {"message": "I need a loan to open a beauty parlour", "language": "english", "expected": "business"},
    {"message": "I want to start a furniture manufacturing unit", "language": "english", "expected": "business"},
    {"message": "I need capital to run my own printing shop", "language": "english", "expected": "business"},

    # Additional English education examples
    {"message": "I need financial assistance for my engineering course", "language": "english", "expected": "education"},
    {"message": "I want to pay my school admission fees", "language": "english", "expected": "education"},
    {"message": "I need money to pursue a postgraduate degree", "language": "english", "expected": "education"},
    {"message": "I want to study medicine but cannot afford the fees", "language": "english", "expected": "education"},
    {"message": "I need funds for my daughter's higher education", "language": "english", "expected": "education"},
    {"message": "I need financial support for a professional course", "language": "english", "expected": "education"},
    {"message": "I want to pay the fees for my diploma course", "language": "english", "expected": "education"},

    # Additional English agriculture examples
    {"message": "I need money to purchase a tractor for my farm", "language": "english", "expected": "agriculture"},
    {"message": "I want to install an irrigation system in my fields", "language": "english", "expected": "agriculture"},
    {"message": "I need funds to buy fertilizers for my crops", "language": "english", "expected": "agriculture"},
    {"message": "I want to start a dairy farming activity", "language": "english", "expected": "agriculture"},
    {"message": "I need a loan to purchase agricultural equipment", "language": "english", "expected": "agriculture"},
    {"message": "I want to improve my farmland with a new water pump", "language": "english", "expected": "agriculture"},
    {"message": "I need money to cultivate rice on my land", "language": "english", "expected": "agriculture"},

    # Additional English unknown examples
    {"message": "I am looking for financial assistance", "language": "english", "expected": "unknown"},
    {"message": "Can someone help me get a loan?", "language": "english", "expected": "unknown"},
    {"message": "I have a financial problem", "language": "english", "expected": "unknown"},
    {"message": "I need some money urgently", "language": "english", "expected": "unknown"},
    {"message": "Please tell me what financial support is available", "language": "english", "expected": "unknown"},
    {"message": "I want to know whether I can get financial help", "language": "english", "expected": "unknown"},
    {"message": "I need assistance but have not decided what it is for", "language": "english", "expected": "unknown"},

    # Additional Telugu business examples
    {"message": "నేను ఒక చిన్న కిరాణా దుకాణం ప్రారంభించాలనుకుంటున్నాను", "language": "telugu", "expected": "business"},
    {"message": "నా బట్టల దుకాణాన్ని విస్తరించడానికి రుణం కావాలి", "language": "telugu", "expected": "business"},
    {"message": "నా వర్క్‌షాప్ కోసం యంత్రాలు కొనాలి", "language": "telugu", "expected": "business"},
    {"message": "నేను చిన్న ఆహార తయారీ యూనిట్ ప్రారంభించాలనుకుంటున్నాను", "language": "telugu", "expected": "business"},
    {"message": "బ్యూటీ పార్లర్ ప్రారంభించడానికి డబ్బు కావాలి", "language": "telugu", "expected": "business"},
    {"message": "ఫర్నిచర్ తయారీ వ్యాపారం ప్రారంభించాలనుకుంటున్నాను", "language": "telugu", "expected": "business"},
    {"message": "నా సొంత ప్రింటింగ్ షాప్ ప్రారంభించడానికి పెట్టుబడి కావాలి", "language": "telugu", "expected": "business"},

    # Additional Telugu education examples
    {"message": "ఇంజినీరింగ్ చదవడానికి ఆర్థిక సహాయం కావాలి", "language": "telugu", "expected": "education"},
    {"message": "నా పాఠశాల అడ్మిషన్ ఫీజు చెల్లించాలి", "language": "telugu", "expected": "education"},
    {"message": "పోస్ట్ గ్రాడ్యుయేషన్ చదవడానికి డబ్బు కావాలి", "language": "telugu", "expected": "education"},
    {"message": "మెడిసిన్ చదవాలనుకుంటున్నాను కానీ ఫీజులు చెల్లించలేను", "language": "telugu", "expected": "education"},
    {"message": "నా కుమార్తె ఉన్నత విద్య కోసం నిధులు కావాలి", "language": "telugu", "expected": "education"},
    {"message": "ఒక ప్రొఫెషనల్ కోర్సు చదవడానికి ఆర్థిక సహాయం కావాలి", "language": "telugu", "expected": "education"},
    {"message": "నా డిప్లొమా కోర్సు ఫీజు చెల్లించడానికి డబ్బు కావాలి", "language": "telugu", "expected": "education"},

    # Additional Telugu agriculture examples
    {"message": "నా పొలం కోసం ట్రాక్టర్ కొనడానికి డబ్బు కావాలి", "language": "telugu", "expected": "agriculture"},
    {"message": "నా పొలంలో నీటిపారుదల వ్యవస్థ ఏర్పాటు చేయాలనుకుంటున్నాను", "language": "telugu", "expected": "agriculture"},
    {"message": "పంటలకు ఎరువులు కొనడానికి నిధులు కావాలి", "language": "telugu", "expected": "agriculture"},
    {"message": "పాడి పరిశ్రమ ప్రారంభించాలనుకుంటున్నాను", "language": "telugu", "expected": "agriculture"},
    {"message": "వ్యవసాయ పరికరాలు కొనడానికి రుణం కావాలి", "language": "telugu", "expected": "agriculture"},
    {"message": "నా పొలానికి కొత్త నీటి మోటారు ఏర్పాటు చేయాలి", "language": "telugu", "expected": "agriculture"},
    {"message": "నా భూమిలో వరి పంట పండించడానికి డబ్బు కావాలి", "language": "telugu", "expected": "agriculture"},

    # Additional Telugu unknown examples
    {"message": "నాకు ఆర్థిక సహాయం కావాలి", "language": "telugu", "expected": "unknown"},
    {"message": "నాకు రుణం పొందడానికి ఎవరో సహాయం చేయగలరా?", "language": "telugu", "expected": "unknown"},
    {"message": "నేను ఆర్థిక సమస్యలో ఉన్నాను", "language": "telugu", "expected": "unknown"},
    {"message": "నాకు అత్యవసరంగా కొంత డబ్బు కావాలి", "language": "telugu", "expected": "unknown"},
    {"message": "అందుబాటులో ఉన్న ఆర్థిక సహాయం గురించి చెప్పండి", "language": "telugu", "expected": "unknown"},
    {"message": "నాకు ఆర్థిక సహాయం లభిస్తుందో లేదో తెలుసుకోవాలి", "language": "telugu", "expected": "unknown"},
    {"message": "నాకు సహాయం కావాలి కానీ దేనికోసం అనేది ఇంకా నిర్ణయించుకోలేదు", "language": "telugu", "expected": "unknown"},

    
    # Additional Hindi business examples
    {"message": "मैं एक छोटी किराने की दुकान शुरू करना चाहता हूँ", "language": "hindi", "expected": "business"},
    {"message": "मुझे अपनी कपड़ों की दुकान बढ़ाने के लिए ऋण चाहिए", "language": "hindi", "expected": "business"},
    {"message": "मैं अपनी कार्यशाला के लिए मशीनें खरीदना चाहता हूँ", "language": "hindi", "expected": "business"},
    {"message": "मैं एक छोटी खाद्य प्रसंस्करण इकाई शुरू करना चाहता हूँ", "language": "hindi", "expected": "business"},
    {"message": "मुझे ब्यूटी पार्लर खोलने के लिए पैसे चाहिए", "language": "hindi", "expected": "business"},
    {"message": "मैं फर्नीचर बनाने का व्यवसाय शुरू करना चाहता हूँ", "language": "hindi", "expected": "business"},
    {"message": "मुझे अपनी प्रिंटिंग की दुकान शुरू करने के लिए पूंजी चाहिए", "language": "hindi", "expected": "business"},

    # Additional Hindi education examples
    {"message": "मुझे इंजीनियरिंग की पढ़ाई के लिए आर्थिक सहायता चाहिए", "language": "hindi", "expected": "education"},
    {"message": "मुझे स्कूल में दाखिले की फीस भरनी है", "language": "hindi", "expected": "education"},
    {"message": "मैं स्नातकोत्तर की पढ़ाई करना चाहता हूँ", "language": "hindi", "expected": "education"},
    {"message": "मैं चिकित्सा की पढ़ाई करना चाहता हूँ लेकिन फीस नहीं भर सकता", "language": "hindi", "expected": "education"},
    {"message": "मुझे अपनी बेटी की उच्च शिक्षा के लिए धन चाहिए", "language": "hindi", "expected": "education"},
    {"message": "मुझे एक व्यावसायिक पाठ्यक्रम के लिए आर्थिक सहायता चाहिए", "language": "hindi", "expected": "education"},
    {"message": "मुझे अपने डिप्लोमा पाठ्यक्रम की फीस भरने के लिए पैसे चाहिए", "language": "hindi", "expected": "education"},

    # Additional Hindi agriculture examples
    {"message": "मुझे अपने खेत के लिए ट्रैक्टर खरीदने के पैसे चाहिए", "language": "hindi", "expected": "agriculture"},
    {"message": "मैं अपने खेत में सिंचाई की व्यवस्था करना चाहता हूँ", "language": "hindi", "expected": "agriculture"},
    {"message": "मुझे अपनी फसल के लिए खाद खरीदने के पैसे चाहिए", "language": "hindi", "expected": "agriculture"},
    {"message": "मैं डेयरी फार्मिंग का काम शुरू करना चाहता हूँ", "language": "hindi", "expected": "agriculture"},
    {"message": "मुझे कृषि उपकरण खरीदने के लिए ऋण चाहिए", "language": "hindi", "expected": "agriculture"},
    {"message": "मैं अपने खेत में पानी का पंप लगाना चाहता हूँ", "language": "hindi", "expected": "agriculture"},
    {"message": "मुझे अपनी जमीन पर धान की खेती करने के लिए पैसे चाहिए", "language": "hindi", "expected": "agriculture"},

    # Additional Hindi unknown examples
    {"message": "मुझे आर्थिक सहायता चाहिए", "language": "hindi", "expected": "unknown"},
    {"message": "क्या कोई मुझे ऋण दिलाने में मदद कर सकता है?", "language": "hindi", "expected": "unknown"},
    {"message": "मैं आर्थिक समस्या से परेशान हूँ", "language": "hindi", "expected": "unknown"},
    {"message": "मुझे तुरंत कुछ पैसों की जरूरत है", "language": "hindi", "expected": "unknown"},
    {"message": "कृपया मुझे उपलब्ध आर्थिक सहायता के बारे में बताएं", "language": "hindi", "expected": "unknown"},
    {"message": "मैं जानना चाहता हूँ कि क्या मुझे आर्थिक मदद मिल सकती है", "language": "hindi", "expected": "unknown"},
    {"message": "मुझे मदद चाहिए लेकिन अभी तय नहीं किया है कि किसलिए", "language": "hindi", "expected": "unknown"},

]