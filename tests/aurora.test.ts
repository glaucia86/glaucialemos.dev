import { describe, expect, it } from "vitest";
import { auroraCopy, auroraRecords } from "@/lib/aurora";

describe("aurora sem fronteiras", () => {
  it("seleciona os registros aprovados pela URL, com metadados reais", () => {
    expect(auroraRecords.pt.url).toContain("repo-doctor-25a6");
    expect(auroraRecords.en.url).toContain("analyzer-136n");
    expect(auroraRecords.es.url).toContain("contoso-real-estate-63i");
    for (const record of Object.values(auroraRecords)) {
      expect(record.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(record.titulo.length).toBeGreaterThan(20);
      expect(record.plataforma).toBe("DEV Community");
    }
    expect(new Set(Object.values(auroraCopy).map(copy => copy.message)).size).toBe(3);
  });
});
