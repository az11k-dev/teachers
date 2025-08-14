import {NextResponse} from 'next/server';

export async function POST(request) {
    const {telegramId, status, comment} = await request.json();
    const token = "8289770320:AAF5ewfCHbSIXex7Z4MuufHN8iVAe-OXBtQ";

    if (!token) {
        return NextResponse.json({error: 'Bot token is not set'}, {status: 500});
    }

    let message = '';
    if (status === 'accepted') {
        message = `Ваша заявка была **принята**!`;
    } else if (status === 'rejected') {
        message = `К сожалению, ваша заявка была **отклонена**!`;
    }

    if (comment) {
        message += `\n\nКомментарий администратора: ${comment}`;
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
            return NextResponse.json({message: 'Notification sent successfully'});
        } else {
            console.error('Telegram API error:', data);
            return NextResponse.json({error: 'Failed to send notification'}, {status: 500});
        }
    } catch (error) {
        console.error('Failed to send notification:', error);
        return NextResponse.json({error: 'Failed to send notification'}, {status: 500});
    }
}