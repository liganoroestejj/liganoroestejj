import { renderHook, waitFor } from "@testing-library/react"
import { useParticipants } from "./useParticipants"

const mockPrepareSelf = jest.fn()
const mockEnsureListed = jest.fn()
const mockList = jest.fn()
jest.mock("../lib/participants", () => ({
  prepareSelf: (...a: unknown[]) => mockPrepareSelf(...a),
  ensureListed: (...a: unknown[]) => mockEnsureListed(...a),
  listParticipants: () => mockList(),
}))

const eu = { uid: "u1", fullName: "Ana" }
const outro = { uid: "u9", fullName: "Bia" }

beforeEach(() => {
  jest.clearAllMocks()
  mockPrepareSelf.mockResolvedValue(eu)
  mockList.mockResolvedValue([outro])
  mockEnsureListed.mockImplementation(async (p: unknown, l: unknown[]) => [...l, p])
})

describe("useParticipants", () => {
  it("começa carregando", () => {
    mockPrepareSelf.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useParticipants("u1"))
    expect(result.current.carregando).toBe(true)
  })

  it("inscrito (pago ou pendente): libera, entra na lista e a traz", async () => {
    const { result } = renderHook(() => useParticipants("u1"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockPrepareSelf).toHaveBeenCalledWith("u1")
    expect(mockEnsureListed).toHaveBeenCalledWith(eu, [outro])
    expect(result.current.liberado).toBe(true)
    expect(result.current.participantes).toEqual([outro, eu])
  })

  it("sem inscrição: não libera nem tenta listar", async () => {
    mockPrepareSelf.mockResolvedValue(null)
    const { result } = renderHook(() => useParticipants("u2"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.liberado).toBe(false)
    expect(mockList).not.toHaveBeenCalled()
  })

  it("admin vê a lista sem estar inscrito e sem se publicar", async () => {
    const { result } = renderHook(() => useParticipants("admin", true))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockPrepareSelf).not.toHaveBeenCalled()
    expect(mockEnsureListed).not.toHaveBeenCalled()
    expect(result.current.participantes).toEqual([outro])
  })

  it("falha vira mensagem de erro", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {})
    mockList.mockRejectedValue(new Error("permission-denied"))
    const { result } = renderHook(() => useParticipants("u1"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.erro).toBe("Não foi possível carregar a lista de inscritos.")
    spy.mockRestore()
  })

  it("sem uid não busca nada", () => {
    renderHook(() => useParticipants(undefined))
    expect(mockPrepareSelf).not.toHaveBeenCalled()
  })
})
