/**
 * Submit an inquiry or contact message.
 */
const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required." });
    }
    const result = await req.collections.contacts.insertOne({
      name: name || "Anonymous Visitor",
      email,
      subject: subject || "General Inquiry",
      message,
      createdAt: new Date(),
      status: "unread",
    });
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve submitted contact messages (admin use).
 */
const getContactMessages = async (req, res) => {
  try {
    const result = await req.collections.contacts.find().sort({ createdAt: -1 }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
};

