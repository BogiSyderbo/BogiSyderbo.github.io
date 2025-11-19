document.addEventListener('DOMContentLoaded', () => {
    console.log('kjatt.fo Landing Page Loaded');

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Simple animation for hero elements on load
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Localization
    const translations = {
        en: {
            nav_features: "Features",
            nav_about: "About",
            nav_contact: "Contact",
            hero_badge: "Now in Beta",
            hero_title_prefix: "Unlock the Power of",
            hero_title_suffix: "Faroese",
            hero_subtitle: "Experience the first AI chatbot fine-tuned specifically for the Faroese language. Accurate, culturally aware, and ready to help.",
            hero_cta_start: "Start Chatting",
            hero_cta_learn: "Learn More",
            features_title: "Why kjatt.fo?",
            feature_1_title: "Native Fluency",
            feature_1_desc: "Trained on a vast corpus of Faroese texts to understand dialects, idioms, and grammar nuances.",
            feature_2_title: "Context Aware",
            feature_2_desc: "Understand cultural references and history specific to the Faroe Islands.",
            feature_3_title: "Instant Translations",
            feature_3_desc: "Seamlessly translate between Faroese and English with high accuracy.",
            footer_rights: "All rights reserved."
        },
        fo: {
            nav_features: "Eginleikar",
            nav_about: "Um okkum",
            nav_contact: "Samband",
            hero_badge: "Nú í Beta",
            hero_title_prefix: "Megið finnur tú við at tosa",
            hero_title_suffix: "føroyskt",
            hero_subtitle: "Royn fyrsta kjattbottin, sum er serliga tillagaður til føroyska málið. Kvikur, mentanarliga tilvitaður og klárur at hjálpa.",
            hero_cta_start: "Byrja eitt kjak",
            hero_cta_learn: "Les meira",
            features_title: "Hví kjatt.fo?",
            feature_1_title: "Móðurmálskunnleiki",
            feature_1_desc: "Vandur á einum stórum savni av føroyskum tekstum fyri at skilja bygdamál og orðatøk.",
            feature_2_title: "Skilur samanhang",
            feature_2_desc: "Skilur serføroyskar mentanarligar tilvísingar og søgu.",
            feature_3_title: "Lyntýðingar",
            feature_3_desc: "Týðir snøgt millum føroyskt og enskt við neyvleika.",
            footer_rights: "All rights reserved."
        }
    };

    let currentLang = 'fo';
    const langToggle = document.getElementById('lang-toggle');

    // Initialize with Faroese
    langToggle.textContent = 'EN';
    updateLanguage(currentLang);

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'fo' : 'en';
        langToggle.textContent = currentLang === 'en' ? 'FO' : 'EN';
        updateLanguage(currentLang);
    });

    function updateLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
    }
});
