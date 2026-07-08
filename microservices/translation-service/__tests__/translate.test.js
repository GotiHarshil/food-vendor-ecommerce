const mockGenerateContent = jest.fn();

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({ generateContent: mockGenerateContent }),
  })),
}));

const request = require("supertest");
const app = require("../app");

describe("POST /translate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("rejects missing text", async () => {
    const res = await request(app).post("/translate").send({});
    expect(res.status).toBe(400);
  });

  it("rejects blank text", async () => {
    const res = await request(app).post("/translate").send({ text: "   " });
    expect(res.status).toBe(400);
  });

  it("translates via Gemini when it succeeds", async () => {
    mockGenerateContent.mockResolvedValue({ response: { text: () => "  नमस्ते  " } });

    const res = await request(app).post("/translate").send({ text: "hello" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.translated).toBe("नमस्ते");
    expect(res.body.source).toBe("gemini");
  });

  it("falls back to MyMemory when Gemini fails", async () => {
    mockGenerateContent.mockRejectedValue(new Error("gemini down"));
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ responseStatus: 200, responseData: { translatedText: "नमस्ते" } }),
    });

    const res = await request(app).post("/translate").send({ text: "hello" });
    expect(res.status).toBe(200);
    expect(res.body.translated).toBe("नमस्ते");
    expect(res.body.source).toBe("mymemory");
  });

  it("returns 500 when both Gemini and MyMemory fail", async () => {
    mockGenerateContent.mockRejectedValue(new Error("gemini down"));
    global.fetch.mockResolvedValue({ ok: false, status: 503 });

    const res = await request(app).post("/translate").send({ text: "hello" });
    expect(res.status).toBe(500);
  });
});
