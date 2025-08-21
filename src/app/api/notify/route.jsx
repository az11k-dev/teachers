import {NextResponse} from 'next/server';

export async function POST(request) {
    const {telegramId, status, comment, vacancyTitle, user} = await request.json();
    const token = "8289770320:AAF5ewfCHbSIXex7Z4MuufHN8iVAe-OXBtQ";

    if (!token) {
        return NextResponse.json({error: 'Bot tokeni oʻrnatilmagan'}, {status: 500});
    }

    let message = '';
    if (status === 'accepted') {
        message = `Hurmatli foydalanuvchi, sizning arizangiz muvaffaqiyatli tarzda qabul qilindi va ko'rib chiqish uchun mas'ul xodimga yuborildi. Tez orada siz bilan bog'lanamiz.`;
    } else if (status === 'rejected') {
        message = `Hurmatli foydalanuvchi, afsuski, sizning arizangiz ko'rib chiqish natijasiga ko'ra rad etildi. Kelajakdagi arizalaringizda omad tilaymiz.`;
    }

    if (comment) {
        message += `\n\n*Qoʻshimcha maʼlumotlar:*`;
        message += `\n\n**Vakansiya:** ${vacancyTitle}`;
        message += `\n**Administrator:** ${user.first_name} ${user.last_name} (${user.phone_number})`;
        message += `\n**Administrator izohi:** ${comment}`;
    }

    const payload = {
        chat_id: telegramId,
        text: message,
        parse_mode: 'Markdown',
    };

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.ok) {
            return NextResponse.json({message: 'Xabar muvaffaqiyatli yuborildi'});
        } else {
            console.error('Telegram API xatosi:', data);
            return NextResponse.json({error: 'Xabar yuborishda xatolik yuz berdi'}, {status: 500});
        }
    } catch (error) {
        console.error('Xabar yuborishda xatolik yuz berdi:', error);
        return NextResponse.json({error: 'Xabar yuborishda xatolik yuz berdi'}, {status: 500});
    }
}