/**
 * GASTROTECHNO GROUP - Hlášení závad
 * Hlavní aplikační logika
 */

// Globální stav aplikace
const appState = {
    step1Data: {},
    step2Data: {},
    photos: []
};

// Email příjemce
const RECIPIENT_EMAIL = 'lapos.tomas@gastrotechnogroup.com';

// Maximální velikost fotky v bytech (1MB)
const MAX_PHOTO_SIZE = 1024 * 1024;

// EmailJS konfigurace - DŮLEŽITÉ: Nastavte své vlastní hodnoty!
// Návod: https://www.emailjs.com/docs/tutorial/overview/
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',      // Získáte na emailjs.com -> Account -> API Keys
    serviceId: 'YOUR_SERVICE_ID',       // Získáte na emailjs.com -> Email Services
    templateId: 'YOUR_TEMPLATE_ID'      // Získáte na emailjs.com -> Email Templates
};

// Příznak, zda je EmailJS nakonfigurován
const isEmailJSConfigured = !EMAILJS_CONFIG.publicKey.includes('YOUR_');

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    // Registrace Service Workeru pro PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registrován'))
            .catch(err => console.log('Service Worker registrace selhala:', err));
    }
    
    // Načtení uložených dat z localStorage (pokud existují)
    loadSavedData();
});

/**
 * Přepínání mezi obrazovkami
 */
function showScreen(screenName) {
    // Skrýt všechny obrazovky
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Zobrazit požadovanou obrazovku
    const targetScreen = document.getElementById(`${screenName}-screen`);
    if (targetScreen) {
        targetScreen.classList.add('active');
        window.scrollTo(0, 0);
    }
}

/**
 * Validace a uložení kroku 1
 */
function validateStep1(event) {
    event.preventDefault();
    
    const form = document.getElementById('step1-form');
    const formData = new FormData(form);
    
    // Uložení dat
    appState.step1Data = {
        company: formData.get('company').trim(),
        address: formData.get('address').trim(),
        name: formData.get('name').trim(),
        phone: formData.get('phone').trim(),
        email: formData.get('email').trim()
    };
    
    // Validace emailu
    if (!isValidEmail(appState.step1Data.email)) {
        alert('Prosím zadejte platnou e-mailovou adresu.');
        document.getElementById('email').focus();
        return false;
    }
    
    // Uložení do localStorage pro případ zavření aplikace
    saveData();
    
    // Přechod na krok 2
    showScreen('step2');
    return false;
}

/**
 * Validace emailu
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Otevření fotoaparátu
 */
function openCamera() {
    document.getElementById('camera-input').click();
}

/**
 * Otevření galerie
 */
function openGallery() {
    document.getElementById('gallery-input').click();
}

/**
 * Zpracování vybraných fotek
 */
async function handlePhotoSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Zobrazení loading indikátoru
    showLoading(true);
    
    try {
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                // Komprese a přidání fotky
                const compressedPhoto = await compressImage(file);
                appState.photos.push(compressedPhoto);
            }
        }
        
        // Aktualizace náhledů
        updatePhotoPreview();
    } catch (error) {
        console.error('Chyba při zpracování fotek:', error);
        alert('Nepodařilo se zpracovat některé fotky.');
    } finally {
        showLoading(false);
        // Reset inputu pro možnost znovu vybrat stejnou fotku
        event.target.value = '';
    }
}

/**
 * Komprese obrázku na maximálně 1MB
 */
async function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Vytvoření canvasu pro kompresi
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Výpočet nových rozměrů
                let { width, height } = img;
                const maxDimension = 1920; // Maximální rozměr pro stranu
                
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Vykreslení zmenšeného obrázku
                ctx.drawImage(img, 0, 0, width, height);
                
                // Postupná komprese dokud není pod 1MB
                let quality = 0.9;
                let result;
                
                const compress = () => {
                    result = canvas.toDataURL('image/jpeg', quality);
                    const size = getBase64Size(result);
                    
                    if (size > MAX_PHOTO_SIZE && quality > 0.1) {
                        quality -= 0.1;
                        compress();
                    }
                };
                
                compress();
                
                resolve({
                    name: file.name,
                    data: result,
                    size: getBase64Size(result),
                    type: 'image/jpeg'
                });
            };
            
            img.onerror = () => reject(new Error('Nepodařilo se načíst obrázek'));
            img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Nepodařilo se přečíst soubor'));
        reader.readAsDataURL(file);
    });
}

/**
 * Výpočet velikosti base64 v bytech
 */
function getBase64Size(base64) {
    const base64Length = base64.length - (base64.indexOf(',') + 1);
    const padding = (base64.charAt(base64.length - 2) === '=') ? 2 :
                    (base64.charAt(base64.length - 1) === '=') ? 1 : 0;
    return (base64Length * 0.75) - padding;
}

/**
 * Aktualizace náhledů fotek
 */
function updatePhotoPreview() {
    const container = document.getElementById('photo-preview');
    container.innerHTML = '';
    
    appState.photos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'photo-item';
        div.innerHTML = `
            <img src="${photo.data}" alt="Fotka ${index + 1}">
            <button type="button" class="photo-remove" onclick="removePhoto(${index})">×</button>
        `;
        container.appendChild(div);
    });
}

/**
 * Odstranění fotky
 */
function removePhoto(index) {
    appState.photos.splice(index, 1);
    updatePhotoPreview();
}

/**
 * Odeslání formuláře
 */
async function submitForm(event) {
    event.preventDefault();
    
    const form = document.getElementById('step2-form');
    const formData = new FormData(form);
    
    // Uložení dat kroku 2
    appState.step2Data = {
        device: formData.get('device').trim(),
        serial: formData.get('serial').trim(),
        description: formData.get('description').trim()
    };
    
    // Zobrazení loading
    showLoading(true);
    
    try {
        // Sestavení a odeslání emailu
        await sendEmail();
        
        // Zobrazení úspěchu
        displaySuccessSummary();
        showScreen('success');
        
        // Vymazání uložených dat
        clearSavedData();
        
    } catch (error) {
        console.error('Chyba při odesílání:', error);
        alert('Nepodařilo se odeslat hlášení. Zkuste to prosím znovu nebo kontaktujte servis přímo na +420 733 383 999.');
    } finally {
        showLoading(false);
    }
    
    return false;
}

/**
 * Sestavení a odeslání emailu
 */
async function sendEmail() {
    const { step1Data, step2Data, photos } = appState;
    
    // Vytvoření předmětu emailu
    const subject = `Hlášení závady - ${step1Data.company} - ${step2Data.device}`;
    
    // Vytvoření těla emailu (text)
    const bodyText = `
HLÁŠENÍ ZÁVADY - GASTROTECHNO GROUP
=====================================

KONTAKTNÍ ÚDAJE
-------------------------------------
Firma/Provozovna: ${step1Data.company}
Adresa: ${step1Data.address}
Kontaktní osoba: ${step1Data.name}
Telefon: ${step1Data.phone}
E-mail: ${step1Data.email}

ÚDAJE O ZAŘÍZENÍ
-------------------------------------
Název zařízení: ${step2Data.device}
Výrobní číslo: ${step2Data.serial}

POPIS ZÁVADY
-------------------------------------
${step2Data.description}

FOTODOKUMENTACE
-------------------------------------
${photos.length > 0 ? `Přiloženo ${photos.length} fotografií.` : 'Bez fotografií.'}

=====================================
Odesláno z mobilní aplikace
Datum: ${new Date().toLocaleString('cs-CZ')}
=====================================
`;

    // Vytvoření HTML těla emailu
    const bodyHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #0d2137, #1a3a5c); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🔧 GASTROTECHNO GROUP</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Hlášení závady</p>
    </div>
    
    <div style="padding: 20px; background: #f5f7fa;">
        <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #1a3a5c; margin-top: 0; border-bottom: 2px solid #e8b923; padding-bottom: 10px;">📋 Kontaktní údaje</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 140px;">Firma:</td><td style="padding: 8px 0; font-weight: bold;">${step1Data.company}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Adresa:</td><td style="padding: 8px 0;">${step1Data.address}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Kontakt:</td><td style="padding: 8px 0;">${step1Data.name}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Telefon:</td><td style="padding: 8px 0;"><a href="tel:${step1Data.phone}" style="color: #1a3a5c;">${step1Data.phone}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #666;">E-mail:</td><td style="padding: 8px 0;"><a href="mailto:${step1Data.email}" style="color: #1a3a5c;">${step1Data.email}</a></td></tr>
            </table>
        </div>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #1a3a5c; margin-top: 0; border-bottom: 2px solid #e8b923; padding-bottom: 10px;">🔧 Údaje o zařízení</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; width: 140px;">Zařízení:</td><td style="padding: 8px 0; font-weight: bold;">${step2Data.device}</td></tr>
                <tr><td style="padding: 8px 0; color: #666;">Výrobní číslo:</td><td style="padding: 8px 0;">${step2Data.serial}</td></tr>
            </table>
        </div>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #1a3a5c; margin-top: 0; border-bottom: 2px solid #e8b923; padding-bottom: 10px;">📝 Popis závady</h2>
            <p style="white-space: pre-wrap; margin: 0; line-height: 1.6;">${step2Data.description}</p>
        </div>
        
        ${photos.length > 0 ? `
        <div style="background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #1a3a5c; margin-top: 0; border-bottom: 2px solid #e8b923; padding-bottom: 10px;">📷 Fotodokumentace (${photos.length} fotografií)</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
                ${photos.map((photo, i) => `<img src="${photo.data}" alt="Foto ${i+1}" style="width: 100%; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">`).join('')}
            </div>
        </div>
        ` : ''}
    </div>
    
    <div style="background: #1a3a5c; color: white; padding: 15px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">Odesláno z mobilní aplikace Gastrotechno Group</p>
        <p style="margin: 5px 0 0 0; opacity: 0.7;">${new Date().toLocaleString('cs-CZ')}</p>
    </div>
</div>
`;

    // Pokud je EmailJS nakonfigurován, použijeme ho
    if (isEmailJSConfigured && typeof emailjs !== 'undefined') {
        try {
            // Inicializace EmailJS
            emailjs.init(EMAILJS_CONFIG.publicKey);
            
            // Odeslání emailu
            await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
                to_email: RECIPIENT_EMAIL,
                from_name: step1Data.name,
                from_email: step1Data.email,
                subject: subject,
                message_html: bodyHtml,
                message_text: bodyText,
                company: step1Data.company,
                address: step1Data.address,
                phone: step1Data.phone,
                device: step2Data.device,
                serial: step2Data.serial,
                description: step2Data.description,
                photo_count: photos.length.toString(),
                // Fotky jako inline obrázky v HTML
                photos_html: photos.map((photo, i) => 
                    `<img src="${photo.data}" alt="Foto ${i+1}" style="max-width: 100%; margin: 10px 0;">`
                ).join('')
            });
            
            console.log('Email odeslán přes EmailJS');
            return;
        } catch (error) {
            console.error('EmailJS chyba:', error);
            // Pokud EmailJS selže, použijeme záložní metodu
        }
    }
    
    // Záložní metoda: mailto s manuálním připojením fotek
    console.log('Používám záložní mailto metodu');
    
    // Pokud jsou fotky, stáhneme je
    if (photos.length > 0) {
        downloadPhotosAsZip();
    }
    
    // Vytvoření mailto odkazu
    const mailtoLink = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    
    // Simulace krátkého zpoždění pro lepší UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Otevření emailu
    window.location.href = mailtoLink;
    
    // Krátká pauza před pokračováním
    await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Stažení fotek jako individuální soubory
 */
function downloadPhotosAsZip() {
    if (appState.photos.length === 0) return;
    
    // Stažení každé fotky jednotlivě
    appState.photos.forEach((photo, index) => {
        const link = document.createElement('a');
        link.href = photo.data;
        link.download = `zavada_foto_${index + 1}.jpg`;
        link.click();
    });
    
    // Upozornění uživatele
    setTimeout(() => {
        alert(`Bylo staženo ${appState.photos.length} fotografií. Prosím připojte je k emailu jako přílohy.`);
    }, 500);
}

/**
 * Zobrazení souhrnu na úspěšné obrazovce
 */
function displaySuccessSummary() {
    const { step1Data, step2Data, photos } = appState;
    const container = document.getElementById('success-summary');
    
    container.innerHTML = `
        <p><strong>Firma:</strong> ${step1Data.company}</p>
        <p><strong>Zařízení:</strong> ${step2Data.device}</p>
        <p><strong>Výr. číslo:</strong> ${step2Data.serial}</p>
        <p><strong>Fotek:</strong> ${photos.length}</p>
    `;
}

/**
 * Reset aplikace
 */
function resetApp() {
    // Vymazání stavu
    appState.step1Data = {};
    appState.step2Data = {};
    appState.photos = [];
    
    // Reset formulářů
    document.getElementById('step1-form').reset();
    document.getElementById('step2-form').reset();
    document.getElementById('photo-preview').innerHTML = '';
    
    // Návrat na úvodní obrazovku
    showScreen('home');
}

/**
 * Zobrazení/skrytí loading overlay
 */
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

/**
 * Uložení dat do localStorage
 */
function saveData() {
    try {
        localStorage.setItem('gtg_step1', JSON.stringify(appState.step1Data));
    } catch (e) {
        console.log('Nelze uložit do localStorage');
    }
}

/**
 * Načtení uložených dat
 */
function loadSavedData() {
    try {
        const saved = localStorage.getItem('gtg_step1');
        if (saved) {
            const data = JSON.parse(saved);
            appState.step1Data = data;
            
            // Vyplnění formuláře
            if (data.company) document.getElementById('company').value = data.company;
            if (data.address) document.getElementById('address').value = data.address;
            if (data.name) document.getElementById('name').value = data.name;
            if (data.phone) document.getElementById('phone').value = data.phone;
            if (data.email) document.getElementById('email').value = data.email;
        }
    } catch (e) {
        console.log('Nelze načíst z localStorage');
    }
}

/**
 * Vymazání uložených dat
 */
function clearSavedData() {
    try {
        localStorage.removeItem('gtg_step1');
    } catch (e) {
        console.log('Nelze vymazat localStorage');
    }
}

// Podpora pro zpětné tlačítko v prohlížeči
window.addEventListener('popstate', (event) => {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        const screenId = currentScreen.id;
        if (screenId === 'step2-screen') {
            showScreen('step1');
        } else if (screenId === 'step1-screen') {
            showScreen('home');
        }
    }
});

// Přidání do historie při navigaci
const originalShowScreen = showScreen;
window.showScreen = function(screenName) {
    history.pushState({ screen: screenName }, '', `#${screenName}`);
    originalShowScreen(screenName);
};

