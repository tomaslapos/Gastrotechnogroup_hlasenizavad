# Gastrotechno Group - Hlášení závad

Mobilní webová aplikace (PWA) pro rychlé a jednoduché hlášení závad na gastronomických zařízeních.

## 🚀 Funkce

- **Dvoukrokový formulář** pro sběr kontaktních údajů a informací o závadě
- **Fotodokumentace** - možnost vyfotit přímo z aplikace nebo nahrát z galerie
- **Automatická komprese fotek** na maximálně 1MB
- **Offline podpora** díky Service Worker
- **Instalovatelná na mobil** jako nativní aplikace (PWA)
- **Responzivní design** optimalizovaný pro mobilní zařízení

## 📱 Instalace na mobil

### Android (Chrome)
1. Otevřete aplikaci v prohlížeči Chrome
2. Klepněte na menu (tři tečky vpravo nahoře)
3. Vyberte "Přidat na plochu" nebo "Instalovat aplikaci"

### iOS (Safari)
1. Otevřete aplikaci v prohlížeči Safari
2. Klepněte na ikonu sdílení (čtverec se šipkou)
3. Vyberte "Přidat na plochu"

## 🖥️ Spuštění lokálně

### Možnost 1: Jednoduchý HTTP server (Python)
```bash
cd "GastrotechnoGroup-hlaseni-zavad"
python -m http.server 8000
```
Poté otevřete http://localhost:8000

### Možnost 2: Node.js server
```bash
npx serve .
```

### Možnost 3: Live Server (VS Code)
1. Nainstalujte rozšíření "Live Server" ve VS Code
2. Klikněte pravým tlačítkem na `index.html`
3. Vyberte "Open with Live Server"

## 📧 Jak funguje odesílání emailu

Aplikace vytvoří předformátovaný email a otevře ho v nativním emailovém klientu zařízení (mailto:). 

**Fotografie:**
- Fotografie jsou automaticky staženy do zařízení
- Uživatel je manuálně připojí k emailu jako přílohy

### Pro plnou automatizaci (volitelné)

Pro automatické odesílání emailů s přílohami je potřeba backend server nebo služba jako:
- [EmailJS](https://www.emailjs.com/) - bezplatná služba pro odesílání emailů z frontendu
- Vlastní backend (Node.js, PHP, apod.)

## 🎨 Generování ikon

Pro generování PNG ikon z SVG souboru:

1. Otevřete `icon.svg` v prohlížeči
2. Použijte online nástroj jako [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Nebo použijte ImageMagick:
```bash
convert icon.svg -resize 192x192 icon-192.png
convert icon.svg -resize 512x512 icon-512.png
```

## 📁 Struktura projektu

```
GastrotechnoGroup-hlaseni-zavad/
├── index.html      # Hlavní HTML stránka
├── styles.css      # CSS styly
├── app.js          # JavaScript aplikační logika
├── manifest.json   # PWA manifest
├── sw.js           # Service Worker pro offline podporu
├── icon.svg        # Vektorová ikona
├── icon-192.png    # Ikona 192x192 (vygenerovat z SVG)
├── icon-512.png    # Ikona 512x512 (vygenerovat z SVG)
└── README.md       # Tento soubor
```

## 🔧 Konfigurace

### Změna emailové adresy příjemce
V souboru `app.js` změňte konstantu:
```javascript
const RECIPIENT_EMAIL = 'lapos.tomas@gastrotechnogroup.com';
```

## 📞 Kontakt

**Gastrotechno Group s.r.o.**
- Web: https://gastrotechnogroup.cz
- Servis: +420 733 383 999
- Email: helpdesk@gastrotechnogroup.cz
- Adresa: Na Luhách 3420/12, Ústí nad Labem 400 01

---

© 2025 Gastrotechno Group s.r.o.


