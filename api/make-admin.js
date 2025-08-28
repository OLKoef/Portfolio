// api/make-admin.js
// Vercel Serverless Function – promote a user to admin

const { createClient } = require('@supabase/supabase-js')

module.exports = async (req, res) => {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1) Check Authorization header (caller must be logged in)
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing bearer token' })

    // Verify caller with anon client + bearer token
    const publicClient = createClient(
      process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } }
      }
    )

    const { data: me, error: meErr } = await publicClient.auth.getUser()
    if (meErr || !me?.user) return res.status(401).json({ error: 'Invalid token' })

    // Only admins may call this endpoint
    const callerRole = me.user.user_metadata?.role
    if (callerRole !== 'admin') {
      return res.status(403).json({ error: 'Admin role required' })
    }

    // 2) Validate input
    if (!req.body || !req.body.userId) {
      return res.status(400).json({ error: 'Missing userId in body' })
    }
    const { userId } = req.body

    // 3) Update target user with Service Role Key
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { role: 'admin' }
    })
    if (error) return res.status(500).json({ error: error.message })

    // 4) Respond
    return res.status(200).json({
      success: true,
      user: { id: data.user.id, user_metadata: data.user.user_metadata }
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
