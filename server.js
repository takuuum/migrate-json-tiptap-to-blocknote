import process from 'node:process'
import { ServerBlockNoteEditor } from '@blocknote/server-util'
import { generateHTML } from '@tiptap/html'
import { StarterKit } from '@tiptap/starter-kit'
import cors from 'cors'
import express from 'express'
import { supabase } from './config/supabase.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

app.get('/api/test-db', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      throw error
    }

    res.json({
      status: 'success',
      message: 'Database connection successful',
      data,
    })
  }
  catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
    })
  }
})

app.post('/api/migrate/:workId', async (req, res) => {
  try {
    const { workId } = req.params

    if (!workId) {
      return res.status(400).json({
        status: 'error',
        message: 'workId is required',
      })
    }

    // Step 1: Get workId from request parameters (already done above)
    console.log('workId', workId)

    // Step 2: Get data from work_drafts table using workId
    const { data: draftData, error: fetchError } = await supabase
      .from('work_drafts')
      .select('data')
      .eq('work_id', workId)
      .single()

    if (fetchError) {
      console.log('fetchError', fetchError)
      throw fetchError
    }

    if (!draftData || !draftData.data) {
      return res.status(404).json({
        status: 'error',
        message: 'No draft data found for this work',
      })
    }

    console.log('draftData', draftData.data)
    // Step 3: Convert data (jsonb) to HTML using @tiptap/html
    const html = generateHTML(draftData.data, [
      // Add your Tiptap extensions here as needed
      StarterKit,
    ])

    console.log('html', html)

    // Step 4: Convert HTML to BlockNote JSON using @blocknote/server-util
    const editor = ServerBlockNoteEditor.create()
    const blocknoteJson = await editor.tryParseHTMLToBlocks(html)

    // Step 5: Update work_drafts table with the converted JSON
    const { data: updateData, error: updateError } = await supabase
      .from('work_drafts')
      .update({ blocknote_data: blocknoteJson })
      .eq('work_id', workId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    res.json({
      status: 'success',
      message: 'Migration completed successfully',
      data: {
        workId,
        originalData: draftData.data,
        html,
        blocknoteData: blocknoteJson,
        updated: updateData,
      },
    })
  }
  catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Migration failed',
      error: error.message,
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Database test: http://localhost:${PORT}/api/test-db`)
})
