import request from "supertest";
import { createApp } from "../src/index";

jest.mock("../src/lib/supabase", () => ({
  supabaseAdmin: {
    auth: { getUser: jest.fn() },
    from: jest.fn()
  }
}));

describe("auth middleware", () => {
  it("rejects missing bearer token on protected routes", async () => {
    const res = await request(createApp()).get("/swaps");
    expect(res.status).toBe(401);
  });
});
