# Nastavení EmailJS pro automatické odesílání emailů

Pro plně automatické odesílání emailů s přílohami přímo z aplikace použijte bezplatnou službu EmailJS.

## 📧 Co je EmailJS?

EmailJS umožňuje odesílat emaily přímo z JavaScriptu bez potřeby backend serveru. Bezplatný plán nabízí 200 emailů měsíčně.

## 🚀 Postup nastavení

### 1. Registrace na EmailJS

1. Přejděte na [https://www.emailjs.com/](https://www.emailjs.com/)
2. Klikněte na **Sign Up Free**
3. Vytvořte účet

### 2. Přidání Email Service

1. Po přihlášení přejděte do **Email Services**
2. Klikněte na **Add New Service**
3. Vyberte **Gmail**, **Outlook** nebo jiný email provider
4. Připojte svůj email účet (např. helpdesk@gastrotechnogroup.cz)
5. Zapište si **Service ID** (např. `service_abc123`)

### 3. Vytvoření Email Template

1. Přejděte do **Email Templates**
2. Klikněte na **Create New Template**
3. Nastavte šablonu:

**Subject (Předmět):**
```
{{subject}}
```

**Content (Obsah):**
```html
{{{message_html}}}
```

Nebo pro textovou verzi:
```
{{message_text}}
```

4. Nastavte příjemce v **To Email** na: `{{to_email}}`
5. Nastavte **Reply To** na: `{{from_email}}`
6. Uložte šablonu a zapište si **Template ID** (např. `template_xyz789`)

### 4. Získání API klíče

1. Přejděte do **Account** → **API Keys**
2. Zkopírujte svůj **Public Key**

### 5. Konfigurace v aplikaci

Otevřete soubor `app.js` a najděte sekci s konfigurací EmailJS:

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',      // Váš Public Key
    serviceId: 'YOUR_SERVICE_ID',       // Vaše Service ID
    templateId: 'YOUR_TEMPLATE_ID'      // Vaše Template ID
};
```

Nahraďte placeholder hodnoty svými skutečnými údaji:

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'abc123xyz789',           // Příklad
    serviceId: 'service_gastrotechno',   // Příklad
    templateId: 'template_zavada'        // Příklad
};
```

### 6. Šablona pro EmailJS (doporučená)

V EmailJS vytvořte šablonu s těmito proměnnými:

| Proměnná | Popis |
|----------|-------|
| `{{to_email}}` | Email příjemce |
| `{{from_name}}` | Jméno odesílatele |
| `{{from_email}}` | Email odesílatele |
| `{{subject}}` | Předmět emailu |
| `{{{message_html}}}` | HTML obsah (triple braces pro HTML) |
| `{{message_text}}` | Textový obsah |
| `{{company}}` | Název firmy |
| `{{address}}` | Adresa provozovny |
| `{{phone}}` | Telefon |
| `{{device}}` | Název zařízení |
| `{{serial}}` | Výrobní číslo |
| `{{description}}` | Popis závady |
| `{{photo_count}}` | Počet fotek |
| `{{{photos_html}}}` | Fotky jako HTML (inline base64) |

**Příklad kompletní šablony:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    {{{message_html}}}
</body>
</html>
```

## ⚠️ Omezení

- **Bezplatný plán:** 200 emailů/měsíc, 50 KB na email
- **Přílohy:** EmailJS podporuje přílohy, ale je lepší vložit fotky přímo do HTML jako base64
- **Velikost:** Fotky jsou komprimovány na max 1MB každá

## 🔧 Řešení problémů

### Email se neodesílá

1. Zkontrolujte Console v prohlížeči (F12 → Console)
2. Ověřte, že jsou všechny klíče správně nastavené
3. Zkontrolujte, že email service je aktivní v EmailJS

### Fotky se nezobrazují

- Fotky jsou vloženy jako base64 v HTML
- Některé email klienty mohou blokovat inline obrázky
- V tomto případě použijte záložní mailto metodu

## 💡 Alternativy

Pokud EmailJS nevyhovuje, zvažte:

1. **Formspree** - [formspree.io](https://formspree.io)
2. **FormSubmit** - [formsubmit.co](https://formsubmit.co)
3. **Vlastní backend** - Node.js s Nodemailer, PHP s mail()

## 📞 Potřebujete pomoc?

Kontaktujte technickou podporu Gastrotechno Group:
- Email: helpdesk@gastrotechnogroup.cz
- Telefon: +420 733 383 999


