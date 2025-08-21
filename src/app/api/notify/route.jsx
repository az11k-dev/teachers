import {NextResponse} from 'next/server';

export async function POST(request) {
    const {telegramId, status, comment, vacancyTitle, user} = await request.json();
    const token = "8289770320:AAF5ewfCHbSIXex7Z4MuufHN8iVAe-OXBtQ";

    if (!token) {
        return NextResponse.json({error: 'Bot tokeni oʻrnatilmagan'}, {status: 500});
    }

    let message = '';

    // Statuslarga qarab turli xabarlar tayyorlaymiz
    switch (status) {
        case 'interview':
            message = `Hurmatli foydalanuvchi, sizning **${vacancyTitle}** lavozimiga yuborgan arizangiz ma'qullandi va siz suhbatga taklif qilindingiz. Maktab ma'muriyati tez orada siz bilan bog'lanadi.`;
            break;
        case 'accepted':
            message = `Hurmatli foydalanuvchi, tabriklaymiz! **${vacancyTitle}** lavozimi uchun o'tkazilgan suhbat natijasiga ko'ra, sizning nomzodingiz qabul qilindi.`;
            break;
        case 'rejected':
            message = `Hurmatli foydalanuvchi, afsuski, **${vacancyTitle}** lavozimi uchun o'tkazilgan suhbat natijasiga ko'ra sizning arizangiz rad etildi. Kelajakdagi arizalaringizda omad tilaymiz.`;
            break;
        case 'rejected_immediately':
            message = `Hurmatli foydalanuvchi, afsuski, **${vacancyTitle}** lavozimiga yuborgan arizangiz dastlabki ko'rib chiqish natijasida rad etildi. Kelajakdagi arizalaringizda omad tilaymiz.`;
            break;
        default:
            message = `Arizangizning holati yangilandi. Iltimos, batafsil ma'lumot uchun saytga kiring.`;
    }

    // Agar izoh bo'lsa, xabarga qo'shamiz
    if (comment) {
        message += `\n\n*Administrator izohi:* ${comment}`;
    }

    // Qo'shimcha ma'lumotlar faqat o'zgartirilgan holatlar uchun bo'lishi kerak, shuning uchun ularni shartli ravishda qo'shamiz.
    if (status !== 'pending') {
        message += `\n\n**Vakansiya:** ${vacancyTitle}`;
        message += `\n**Administrator:** ${user.first_name} ${user.last_name} (${user.phone_number})`;
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