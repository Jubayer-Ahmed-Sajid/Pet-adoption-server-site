const { ObjectId } = require("../config/db");

/**
 * Retrieve all pet listings.
 */
const getAllPets = async (req, res) => {
  try {
    const result = await req.collections.pets.find().toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Search pets by name regex.
 */
const searchPets = async (req, res) => {
  try {
    const { name } = req.query;
    const query = name ? { name: { $regex: name, $options: "i" } } : {};
    const result = await req.collections.pets.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Filter pets by category slug (dog, cat, bird, fish).
 */
const getPetsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const result = await req.collections.pets.find({ category }).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieve a specific pet by ObjectId string.
 */
const getPetById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.pets.findOne(query);
    if (!result) return res.status(404).json({ error: "Pet not found" });
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid pet ID format" });
  }
};

/**
 * Create a new pet companion listing with schema normalization.
 */
const createPet = async (req, res) => {
  try {
    const pet = req.body;
    const normalizedPet = {
      name: pet.name || pet.pet_name,
      category: pet.category,
      age: Number(pet.age) || 1,
      pet_location: pet.pet_location,
      image:
        pet.image ||
        pet.pet_image ||
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
      short_description: pet.short_description || "",
      long_description: pet.long_description || "",
      adopted: false,
      email: pet.email || pet.user_email,
      user_name: pet.user_name || "Foster Volunteer",
      AddedDate:
        pet.AddedDate ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      health_status: pet.health_status || "100% Vetted Health",
      traits: pet.traits || ["Vaccinated", "Socialized"],
    };

    const result = await req.collections.pets.insertOne(normalizedPet);
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update an existing pet listing (PUT or PATCH).
 */
const updatePet = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPet = req.body;
    const filter = { _id: new ObjectId(id) };
    const updatedDoc = {
      $set: {
        ...(updatedPet.name || updatedPet.pet_name ? { name: updatedPet.name || updatedPet.pet_name } : {}),
        ...(updatedPet.age !== undefined ? { age: Number(updatedPet.age) } : {}),
        ...(updatedPet.pet_location ? { pet_location: updatedPet.pet_location } : {}),
        ...(updatedPet.image || updatedPet.pet_image ? { image: updatedPet.image || updatedPet.pet_image } : {}),
        ...(updatedPet.short_description !== undefined ? { short_description: updatedPet.short_description } : {}),
        ...(updatedPet.long_description !== undefined ? { long_description: updatedPet.long_description } : {}),
        ...(updatedPet.category ? { category: updatedPet.category } : {}),
        ...(updatedPet.adopted !== undefined ? { adopted: updatedPet.adopted } : {}),
        ...(updatedPet.email ? { email: updatedPet.email } : {}),
      },
    };
    const result = await req.collections.pets.updateOne(filter, updatedDoc);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid pet ID or payload" });
  }
};

/**
 * Delete a pet listing.
 */
const deletePet = async (req, res) => {
  const { id } = req.params;
  try {
    const query = { _id: new ObjectId(id) };
    const result = await req.collections.pets.deleteOne(query);
    res.send(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid pet ID format" });
  }
};

/**
 * Get all pets listed by a specific user email.
 */
const getAddedPets = async (req, res) => {
  try {
    const email = req.query?.email;
    const query = email ? { email } : {};
    const result = await req.collections.pets.find(query).toArray();
    res.send(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin action: toggle or mark pet as adopted.
 */
const markAdoptedAdmin = async (req, res) => {
  const { id } = req.params;
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
    res.status(400).json({ error: "Invalid pet ID format" });
  }
};

module.exports = {
  getAllPets,
  searchPets,
  getPetsByCategory,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  getAddedPets,
  markAdoptedAdmin,
};

