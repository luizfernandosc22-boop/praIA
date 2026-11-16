// Armazenamento local do praIA.
// Substitui o window.storage do ambiente de protótipo por localStorage,
// que funciona em qualquer navegador depois do deploy.
//
// Quando houver backend, basta trocar o corpo destas três funções
// por chamadas à API — o resto do app não muda.

const disponivel = (() => {
  try {
    const t = "__praia_test__";
    window.localStorage.setItem(t, "1");
    window.localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
})();

const memoria = new Map();

export const storage = {
  async get(chave) {
    if (!disponivel) return { value: memoria.get(chave) ?? null };
    return { value: window.localStorage.getItem(chave) };
  },
  async set(chave, valor) {
    if (!disponivel) { memoria.set(chave, valor); return; }
    try {
      window.localStorage.setItem(chave, valor);
    } catch (e) {
      // Cota estourada: normalmente por excesso de fotos em base64.
      console.warn("praIA: não foi possível salvar o estado", e);
    }
  },
  async delete(chave) {
    if (!disponivel) { memoria.delete(chave); return; }
    window.localStorage.removeItem(chave);
  },
};
