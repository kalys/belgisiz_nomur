import { Bot, InlineKeyboard, webhookCallback } from 'grammy'
import { createServer } from 'node:http'
import { normalizePhone } from '@belgisiz-nomur/phone-utils'
import { api, type Category } from './api.js'
import { formatNumber, CATEGORY_LABELS, CATEGORIES } from './format.js'

const token = process.env.TELEGRAM_BOT_TOKEN
if (!token) throw new Error('TELEGRAM_BOT_TOKEN is required')

const bot = new Bot(token)

// In-memory session — only needed during the "awaiting comment" step
interface ReportSession {
  number: string
  category: Category
}
const sessions = new Map<number, ReportSession>()

// --- Helpers ---

async function lookupAndReply(ctx: { chatId: number; reply: Function }, input: string) {
  const normalized = normalizePhone(input)
  if (!normalized) {
    return ctx.reply('❌ Номер таанылган жок. Мисал: 0700123456 же +996700123456')
  }
  try {
    const data = await api.getNumber(normalized.e164)
    return ctx.reply(formatNumber(data), {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    })
  } catch {
    return ctx.reply('❌ Сервер менен байланышуу мүмкүн болгон жок.')
  }
}

function categoryKeyboard(number: string) {
  const kb = new InlineKeyboard()
  CATEGORIES.forEach((cat, i) => {
    kb.text(CATEGORY_LABELS[cat], `cat:${cat}:${number}`)
    if (i % 2 === 1) kb.row()
  })
  return kb
}

// --- Commands ---

bot.command('start', (ctx) =>
  ctx.reply(
    '<b>Белгисиз Номер</b> ботуна кош келиңиз! 👋\n\n' +
      'Кыргызстандагы телефон номерлерин текшерүүгө жардам берет.\n\n' +
      '<b>Колдонуу:</b>\n' +
      '• /check <i>номер</i> — номерди текшерүү\n' +
      '• /report <i>номер</i> — арыз берүү\n' +
      '• Же жөн гана номерди жазыңыз',
    { parse_mode: 'HTML' },
  ),
)

bot.command('check', (ctx) => {
  const input = ctx.match.trim()
  if (!input) return ctx.reply('Номерди жазыңыз: /check 0700123456')
  return lookupAndReply(ctx, input)
})

bot.command('report', (ctx) => {
  const input = ctx.match.trim()
  if (!input) return ctx.reply('Номерди жазыңыз: /report 0700123456')

  const normalized = normalizePhone(input)
  if (!normalized) return ctx.reply('❌ Номер таанылган жок.')

  const chatId = ctx.chatId
  if (!chatId) return
  sessions.delete(chatId)

  return ctx.reply(
    `📞 <b>${normalized.e164}</b>\n\nКатегорияны тандаңыз:`,
    { parse_mode: 'HTML', reply_markup: categoryKeyboard(normalized.e164) },
  )
})

// --- Report flow: category selection ---

bot.callbackQuery(/^cat:([^:]+):(.+)$/, async (ctx) => {
  const chatId = ctx.chatId
  if (!chatId) return ctx.answerCallbackQuery()
  const category = ctx.match[1] as Category
  const number = ctx.match[2]

  sessions.set(chatId, { number, category })

  await ctx.answerCallbackQuery()
  await ctx.editMessageReplyMarkup()

  return ctx.reply(
    `Категория: <b>${CATEGORY_LABELS[category]}</b> ✓\n\nКомментарий кошосузбу? (коюу эмес болсо, "Өткөрүп жибер" дегенди басыңыз)`,
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('Өткөрүп жибер', 'skip_comment'),
    },
  )
})

// --- Report flow: skip comment ---

bot.callbackQuery('skip_comment', async (ctx) => {
  const chatId = ctx.chatId
  if (!chatId) return ctx.answerCallbackQuery()
  const session = sessions.get(chatId)
  if (!session) return ctx.answerCallbackQuery('Сессия аяктады. /report менен кайра баштаңыз.')

  sessions.delete(chatId)
  await ctx.answerCallbackQuery()
  await ctx.editMessageReplyMarkup()

  try {
    await api.submitReport(session.number, { category: session.category })
    return ctx.reply('✅ Арыз кабыл алынды! Рахмат.')
  } catch {
    return ctx.reply('❌ Жиберүүдө ката болду. Кийинчерек кайра аракет кылыңыз.')
  }
})

// --- Text messages: report comment or bare number lookup ---

bot.on('message:text', async (ctx) => {
  const text = ctx.message.text.trim()
  if (text.startsWith('/')) return // unrecognized command — ignore

  const session = sessions.get(ctx.chatId)
  if (session) {
    sessions.delete(ctx.chatId)
    try {
      await api.submitReport(session.number, { category: session.category, comment: text })
      return ctx.reply('✅ Арыз кабыл алынды! Рахмат.')
    } catch {
      return ctx.reply('❌ Жиберүүдө ката болду. Кийинчерек кайра аракет кылыңыз.')
    }
  }

  return lookupAndReply(ctx, text)
})

// --- Inline mode ---

bot.on('inline_query', async (ctx) => {
  const input = ctx.inlineQuery.query.trim()
  if (input.length < 3) return ctx.answerInlineQuery([])

  const normalized = normalizePhone(input)
  if (!normalized) return ctx.answerInlineQuery([])

  let messageText: string
  let description: string

  try {
    const data = await api.getNumber(normalized.e164)
    messageText = formatNumber(data)
    description =
      data.score.report_count === 0 ? 'Арыздар жок' : `${data.score.report_count} арыз`
  } catch {
    messageText = `📞 <b>${normalized.e164}</b>\n\nМаалымат жок`
    description = 'Маалымат жок'
  }

  return ctx.answerInlineQuery(
    [
      {
        type: 'article' as const,
        id: normalized.e164,
        title: normalized.e164,
        description,
        input_message_content: {
          message_text: messageText,
          parse_mode: 'HTML' as const,
          link_preview_options: { is_disabled: true },
        },
      },
    ],
    { cache_time: 60 },
  )
})

// --- Error handler ---

bot.catch((err) => {
  console.error('Bot error:', err)
})

// --- Start: webhook or long polling ---

const webhookUrl = process.env.BOT_WEBHOOK_URL
if (webhookUrl) {
  const port = Number(process.env.BOT_PORT ?? 3002)
  await bot.api.setWebhook(webhookUrl)
  const handler = webhookCallback(bot, 'http')
  createServer(async (req, res) => {
    if (req.method === 'POST') {
      await handler(req, res)
    } else {
      res.writeHead(200).end('ok')
    }
  }).listen(port, () => console.log(`Webhook server on :${port}`))
} else {
  console.log('Bot started (long polling)')
  await bot.start()
}
