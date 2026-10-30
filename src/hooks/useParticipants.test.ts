import { renderHook, waitFor } from "@testing-library/react"
import { useParticipants } from "./useParticipants"

const mockIsParticipant = jest.fn()
const mockList = jest.fn()
jest.mock("../lib/participants", () => ({
  isParticipant: (...a: unknown[]) => mockIsParticipant(...a),
  listParticipants: () => mockList(),
}))

const lista = [{ uid: "u1", fullName: "Ana" }]

beforeEach(() => {
  jest.clearAllMocks()
  mockIsParticipant.mockResolvedValue(true)
  mockList.mockResolvedValue(lista)
})

describe("useParticipants", () => {
  it("começa carregando", () => {
    mockIsParticipant.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useParticipants("u1"))
    expect(result.current.carregando).toBe(true)
  })

  it("inscrito pago: libera e traz a lista", async () => {
    const { result } = renderHook(() => useParticipants("u1"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockIsParticipant).toHaveBeenCalledWith("u1")
    expect(result.current.liberado).toBe(true)
    expect(result.current.participantes).toEqual(lista)
  })

  it("sem inscrição paga: não libera nem tenta listar", async () => {
    mockIsParticipant.mockResolvedValue(false)
    const { result } = renderHook(() => useParticipants("u2"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.liberado).toBe(false)
    expect(mockList).not.toHaveBeenCalled()
  })

  it("admin vê a lista sem estar inscrito", async () => {
    const { result } = renderHook(() => useParticipants("admin", true))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockIsParticipant).not.toHaveBeenCalled()
    expect(result.current.participantes).toEqual(lista)
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
    expect(mockIsParticipant).not.toHaveBeenCalled()
  })
})
