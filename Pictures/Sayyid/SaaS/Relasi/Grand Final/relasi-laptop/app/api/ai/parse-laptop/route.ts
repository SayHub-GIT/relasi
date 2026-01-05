export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const lowerText = text.toLowerCase()

    // Helper to extract values using regex patterns
    const extract = (patterns: RegExp[]) => {
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match[1]) return match[1].trim()
      }
      return ""
    }

    // Logic to parse price (e.g., 5.45jt, 5.000.000, 15jt+)
    let price = 0
    const priceMatch = text.match(/(?:rp|price|harga)?\s?([\d.,]+)\s?(jt|juta)?/i)
    if (priceMatch) {
      const val = priceMatch[1].replace(/[.,]/g, "")
      const isJuta = priceMatch[2] || /jt|juta/i.test(text)

      if (isJuta && val.length <= 4) {
        price = Number.parseFloat(priceMatch[1].replace(/,/g, ".")) * 1000000
      } else {
        price = Number.parseInt(val)
      }
    }

    const data = {
      name: text.split("\n")[0].trim() || "New Laptop",
      description: text.substring(0, 200) + "...",
      price: price,
      year: Number.parseInt(extract([/(\d{4})/])) || new Date().getFullYear(),
      condition: lowerText.includes("new") && !lowerText.includes("second") ? "new" : "second",
      processor: extract([/processor|cpu|intel|amd:?\s*(.*)/i, /#\s*(Intel.*|AMD.*)/i]),
      ram: extract([/memory|ram:?\s*(.*)/i, /#\s*(Memory.*|RAM.*)/i]),
      storage: extract([/storage|ssd|hdd:?\s*(.*)/i, /#\s*(SSD.*|HDD.*|Storage.*)/i]),
      display: extract([/display|screen:?\s*(.*)/i, /#\s*(Display.*|Screen.*)/i]),
      gpu: extract([/gpu|vga|graphics:?\s*(.*)/i, /#\s*(NVIDIA.*|AMD Radeon.*|Graphics.*)/i]),
      keyboard: extract([/keyboard:?\s*(.*)/i, /#\s*(Keyboard.*)/i]),
      camera: extract([/camera|webcam:?\s*(.*)/i, /#\s*(Camera.*)/i]),
      ports: extract([/ports|usb|hdmi:?\s*(.*)/i, /#\s*(USB.*|HDMI.*|Ethernet.*)/i]),
      weight: extract([/weight|berat:?\s*(.*)/i]),
    }

    return Response.json({ data })
  } catch (error) {
    console.error("[v0] Parsing Error:", error)
    return new Response(JSON.stringify({ error: "Failed to parse data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
