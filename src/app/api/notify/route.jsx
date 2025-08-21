import {NextResponse} from 'next/server';

export async function POST(request) {
    const {telegramId, status, comment, vacancyTitle, user} = await request.json();
    const token = "8289770320:AAF5ewfCHbSIXex7Z4MuufHN8iVAe-OXBtQ";

    if (!token) {
        return NextResponse.json({error: 'Bot tokeni oʻrnatilmagan'}, {status: 500});
    }

    let message = '';
    if (status === 'accepted') {
        message = `Arizangiz qabul qilindi!`;
    } else if (status === 'rejected') {
        message = `Afsuski, arizangiz rad etildi!`;
    }

    if (comment) {
        message += `\n\nVakansiya: ${vacancyTitle}`;
        message += `\n\nAdminstrator: ${user.first_name} ${user.last_name} (${user.phone_confirm})`;
        message += `\n\nAdministrator izohi: ${comment}`;
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