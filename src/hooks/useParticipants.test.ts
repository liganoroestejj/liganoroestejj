import { renderHook, waitFor } from "@testing-library/react"
import { useParticipants } from "./useParticipants"

const mockIsViewer = jest.fn()
const mockEnsureViewer = jest.fn()
const mockList = jest.fn()
jest.mock("../lib/participants", () => ({
  isViewer: (...a: unknown[]) => mockIsViewer(...a),
  ensureViewer: (...a: unknown[]) => mockEnsureViewer(...a),
  listParticipants: () => mockList(),
}))

const lista = [{ uid: "u1", fullName: "Ana" }]

beforeEach(() => {
  jest.clearAllMocks()
  mockIsViewer.mockResolvedValue(true)
  mockEnsureViewer.mockResolvedValue(false)
  mockList.mockResolvedValue(lista)
})

describe("useParticipants", () => {
  it("começa carregando", () => {
    mockIsViewer.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useParticipants("u1"))
    expect(result.current.carregando).toBe(true)
  })

  it("já liberado: traz a lista sem gravar nada", async () => {
    const { result } = renderHook(() => useParticipants("u1"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockIsViewer).toHaveBeenCalledWith("u1")
    expect(mockEnsureViewer).not.toHaveBeenCalled()
    expect(result.current.liberado).toBe(true)
    expect(result.current.participantes).toEqual(lista)
  })

  it("inscrito ainda não liberado (pago ou pendente): se libera e traz a lista", async () => {
    mockIsViewer.mockResolvedValue(false)
    mockEnsureViewer.mockResolvedValue(true)
    const { result } = renderHook(() => useParticipants("u3"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockEnsureViewer).toHaveBeenCalledWith("u3")
    expect(result.current.liberado).toBe(true)
    expect(result.current.participantes).toEqual(lista)
  })

  it("sem inscrição: não libera nem tenta listar", async () => {
    mockIsViewer.mockResolvedValue(false)
    const { result } = renderHook(() => useParticipants("u2"))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.liberado).toBe(false)
    expect(mockList).not.toHaveBeenCalled()
  })

  it("admin vê a lista sem estar inscrito", async () => {
    const { result } = renderHook(() => useParticipants("admin", true))
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(mockIsViewer).not.toHaveBeenCalled()
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
    expect(mockIsViewer).not.toHaveBeenCalled()
  })
})
