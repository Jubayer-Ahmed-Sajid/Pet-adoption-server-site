/**
 * Retrieve special sanctuary and adoption events.
 */
const getSpecialEvents = async (req, res) => {
  try {
    const result = await req.collections.events.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getSpecialEvents,
};
