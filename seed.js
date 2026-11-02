const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vqva6ft.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const initialPets = [
  {
    name: "Callie",
    category: "dog",
    age: 1,
    pet_location: "Oakland Foster Shelter, CA",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    short_description: "Gentle, eager to learn, and ready for an active family home.",
    long_description: "Callie is an affectionate 1-year-old Golden Retriever mix who was rescued from an overcrowded regional intake. She is fully vaccinated, microchipped, foster-socialized, and loves children and other dogs. Her favorite activities include outdoor walks, learning basic agility, and resting gently near her foster family.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "100% Vetted Health",
    traits: ["Vaccinated", "Socialized", "Playful", "Microchipped"],
  },
  {
    name: "Luna",
    category: "cat",
    age: 1,
    pet_location: "Bay Area Rescue Center, CA",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80",
    short_description: "Sweet, purrs endlessly, and loves sunny window perches.",
    long_description: "Luna is a gentle domestic shorthair kitten with striking eyes and a calming presence. She is litter-box trained, neutered, up to date on all core vaccinations, and thrives in quiet, loving indoor homes with cozy nap spots.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Health Verified",
    traits: ["Litter Box Trained", "Microchipped", "Cuddle Bug"],
  },
  {
    name: "Barley & Maya",
    category: "dog",
    age: 2,
    pet_location: "Pacific Companion Foundation, CA",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80",
    short_description: "Loyal companion with a heart of gold who loves long trail walks.",
    long_description: "Barley is a friendly Shepherd mix who has completed obedience foundations and crate training. He is exceptionally loyal, loves greeting trail walkers, and would thrive in a home with an active guardian or fenced yard.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "100% Vetted Health",
    traits: ["Obedience Trained", "Great with Kids", "Gentle"],
  },
  {
    name: "Max",
    category: "dog",
    age: 3,
    pet_location: "San Francisco Animal Sanctuary, CA",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    short_description: "Friendly Labrador Retriever mix with a joyful zest for life.",
    long_description: "Max is an energetic and well-mannered Labrador mix who loves fetch, splashing in lakes, and leaning in for head scratches. He gets along wonderfully with other dogs and has passed complete clinical and behavioral exams.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Fully Vaccinated & Neutered",
    traits: ["Leash Trained", "Friendly", "Active"],
  },
  {
    name: "Whiskers",
    category: "cat",
    age: 4,
    pet_location: "Sunnyvale Foster Home, CA",
    image: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80",
    short_description: "Cuddly Tabby cat with a relaxing, warm disposition.",
    long_description: "Whiskers is a seasoned lap cat whose ideal afternoon consists of watching birds from a warm sunbeam. He is quiet, independent, affectionate, and fully vaccinated and litter-box trained.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Senior Health Screened",
    traits: ["Calm", "Lap Cat", "Indoor Only"],
  },
  {
    name: "Bella",
    category: "dog",
    age: 2,
    pet_location: "Marin County Foster League, CA",
    image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80",
    short_description: "Intelligent Border Collie mix who loves learning new tricks.",
    long_description: "Bella is sharp, attentive, and deeply bonded to her human caregivers. She knows sit, stay, recall, and paw, and would be a wonderful companion for runners or hikers.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Clinical Exam Cleared",
    traits: ["High Energy", "Agility Ready", "Eager Learner"],
  },
  {
    name: "Tweety",
    category: "bird",
    age: 2,
    pet_location: "Berkeley Aviary Sanctuary, CA",
    image: "https://images.unsplash.com/photo-1522858547550-3405742f160d?auto=format&fit=crop&w=800&q=80",
    short_description: "Cheerful canary bird whose sweet songs brighten any room.",
    long_description: "Tweety is a healthy, active canary with beautiful plumage. He enjoys gentle vocal interaction, fresh fruit treats, and spacious flight enclosures.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Avian Health Certified",
    traits: ["Musical", "Healthy Plumage", "Active"],
  },
  {
    name: "Kiwi",
    category: "bird",
    age: 1,
    pet_location: "Palo Alto Pet Rescue, CA",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=800&q=80",
    short_description: "Playful parakeet with vivid green feathers and curious personality.",
    long_description: "Kiwi is hand-tame, loves perching on fingers, and investigates bird-safe puzzle toys. He comes with complete nutritional and housing guidelines.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Parasite Free & Vetted",
    traits: ["Hand Tame", "Social", "Inquisitive"],
  },
  {
    name: "Goldie",
    category: "fish",
    age: 1,
    pet_location: "Pacific Aquarium Rescue, CA",
    image: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=800&q=80",
    short_description: "Stunning Halfmoon Betta with vibrant iridescent red & blue fins.",
    long_description: "Goldie is a lively Betta fish rescued from an inadequate bowl setup, now flourishing in a planted, heated 5-gallon habitat. He recognizes feeding time and swims up to greet visitors.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Fin & Water Quality Tested",
    traits: ["Planted Tank Ready", "Active Swimmer", "Resilient"],
  },
  {
    name: "Coral & School",
    category: "fish",
    age: 1,
    pet_location: "San Jose Marine Care, CA",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=800&q=80",
    short_description: "Peaceful school of 6 Neon Tetras bringing tranquil color to any aquarium.",
    long_description: "This peaceful group of healthy Neon Tetras schools together seamlessly. Perfect for established freshwater community tanks.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Quarantined & Healthy",
    traits: ["Community Safe", "Schooling Fish", "Peaceful"],
  },
  {
    name: "Milo",
    category: "cat",
    age: 2,
    pet_location: "Redwood City Foster Network, CA",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80",
    short_description: "Playful ginger cat who loves feather wands and warm blankets.",
    long_description: "Milo is an outgoing 2-year-old orange tabby with big personality. He greets you at the door, loves head rubs, and gets along well with gentle dogs.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Neutered & Core Vaccinated",
    traits: ["Outgoing", "Playful", "Affectionate"],
  },
  {
    name: "Buster",
    category: "dog",
    age: 4,
    pet_location: "East Bay Humane Partners, CA",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80",
    short_description: "Sweet Beagle mix with soulful eyes and gentle demeanor.",
    long_description: "Buster is an easygoing companion who enjoys sniffing in the backyard and snuggling on dog beds. He is quiet, gentle with kids, and walks nicely on a harness.",
    adopted: false,
    email: "adoptions@pawsandhearts.org",
    AddedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    health_status: "Heartworm Negative & Microchipped",
    traits: ["Gentle", "Good with Kids", "Snuggle Bug"],
  },
];

const initialDonations = [
  {
    pet_name: "Archie",
    category: "dog",
    max_donation_amount: 5000,
    donated_amount: 3875,
    donor_count: 64,
    last_date: "Nov 30 2026",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=800&q=80",
    short_description: "Archie's Hip Replacement Campaign — Full surgical recovery & physical therapy fund.",
    long_description: "Archie arrived at our rescue partner requiring an urgent femoral head ostectomy after being hit by a vehicle. Thanks to community donations, his surgery was fully funded and completed. He is currently finishing hydrotherapy recovery and will soon be ready for adoption.",
    status: "Continue",
    email: "medical@pawsandhearts.org",
    AddedDate: "Oct 15 2026",
    clinic_name: "Bay Area Veterinary Surgery Center",
  },
  {
    pet_name: "Maklu",
    category: "cat",
    max_donation_amount: 1500,
    donated_amount: 920,
    donor_count: 28,
    last_date: "Dec 15 2026",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80",
    short_description: "Emergency nutrition and medical rehabilitation for rescued foster kitten Maklu.",
    long_description: "Maklu was found malnourished with an upper respiratory infection. He requires specialized veterinary formula, nebulizer therapy, and clinical monitoring to reach a healthy adoption weight.",
    status: "Continue",
    email: "medical@pawsandhearts.org",
    AddedDate: "Oct 20 2026",
    clinic_name: "Mission Pet Hospital",
  },
  {
    pet_name: "Barnaby",
    category: "dog",
    max_donation_amount: 2500,
    donated_amount: 1980,
    donor_count: 36,
    last_date: "Dec 31 2026",
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80",
    short_description: "Senior rescue Barnaby's gentle heartworm treatment and dental scaling fund.",
    long_description: "Barnaby is an 8-year-old golden mix undergoing safe heartworm adulticide therapy and extensive dental surgery so he can spend his golden years pain-free with a loving foster family.",
    status: "Continue",
    email: "medical@pawsandhearts.org",
    AddedDate: "Oct 25 2026",
    clinic_name: "NorCal Animal Health Specialists",
  },
];

async function seed() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db("petsDB");
    const petCollection = db.collection("pets");
    const donationCollection = db.collection("donations");

    // Replace test entries with rich authentic supply
    await petCollection.deleteMany({});
    const petResult = await petCollection.insertMany(initialPets);
    console.log(`Successfully seeded ${petResult.insertedCount} companion pets!`);

    await donationCollection.deleteMany({});
    const donationResult = await donationCollection.insertMany(initialDonations);
    console.log(`Successfully seeded ${donationResult.insertedCount} donation campaigns!`);

    const petCount = await petCollection.countDocuments();
    const donationCount = await donationCollection.countDocuments();
    console.log(`Current DB State: ${petCount} pets, ${donationCount} campaigns.`);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    await client.close();
  }
}

seed();
