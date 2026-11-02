const { ObjectId } = require("../config/db");

/**
 * Submit an adoption application for a pet.
 */
const createAdoptionRequest = async (req, res) => {
  try {
    const requestedInfo = {
      ...req.body,
      createdAt: new Date(),
      status: req.body.status || "pending",
    };
    const result = await req.collections.requested.insertOne(requestedInfo);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get adoption requests, optionally filtered by user email.
 */
const getAdoptionRequests = async (req, res) => {
  try {
    const email = req.query.email;
    const query = email ? { $or: [{ email }, { requester_email: email }] } : {};
    const result = await req.collections.requested.find(query).sort({ createdAt: -1 }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve a specific adoption request by ID.
 */
const getAdoptionRequestById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.requested.findOne(query);
    if (!result) return res.status(404).json({ error: "Adoption request not found" });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid request ID format" });
  }
};

/**
 * Update adoption request status (accept, adopt, reject).
 */
const updateAdoptionRequestStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: {
        status: req.body.status || "adopted",
      },
    };
    const result = await req.collections.requested.updateOne(filter, updatedDoc, options);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid request ID" });
  }
};

/**
 * Atomically approve an adoption request and update companion status to adopted.
 */
const approveAdoptionRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const request = await req.collections.requested.findOne({ _id: new ObjectId(id) });
    if (!request) return res.status(404).json({ error: "Adoption request not found" });

    // Mark request as approved
    await req.collections.requested.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved", approvedAt: new Date() } }
    );

    // If request contains pet_name or pet_id, mark pet as adopted
    if (request.pet_id) {
      try {
        await req.collections.pets.updateOne(
          { _id: new ObjectId(request.pet_id) },
          { $set: { adopted: true, adoptedBy: request.requester_email || request.email } }
        );
      } catch (e) {}
    }
    if (request.pet_name) {
      await req.collections.pets.updateOne(
        { name: request.pet_name },
        { $set: { adopted: true, adoptedBy: request.requester_email || request.email } }
      );
    }

    res.json({ success: true, message: "Adoption approved and companion marked as adopted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Reject an adoption request.
 */
const rejectAdoptionRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.collections.requested.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "rejected", rejectedAt: new Date() } }
    );
    res.json({ success: true, message: "Adoption request rejected." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mark pet as adopted through adoption request query (?id=...).
 */
const markPetAdoptedFromRequest = async (req, res) => {
  const { id } = req.query;
  try {
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        adopted: true,
      },
    };
    const result = await req.collections.pets.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid pet ID" });
  }
};

/**
 * Delete / reject an adoption request.
 */
const deleteAdoptionRequest = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.requested.deleteOne(query);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid request ID" });
  }
};

module.exports = {
  createAdoptionRequest,
  getAdoptionRequests,
  getAdoptionRequestById,
  updateAdoptionRequestStatus,
  approveAdoptionRequest,
  rejectAdoptionRequest,
  markPetAdoptedFromRequest,
  deleteAdoptionRequest,
};
