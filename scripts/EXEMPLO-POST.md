# Como usar scripts/criar-post.ts

## Pré-requisitos

- Arquivo HTML com o conteúdo do post
- Fotos em `scripts/post-images/`
- Variáveis de ambiente no `.env.local` (R2 e DATABASE_URL)

## Executar

```
npx tsx scripts/criar-post.ts caminho/do/artigo.html
```

O script fará upload das fotos para o R2 e depois pedirá as
informações via terminal.

---

## Formato do arquivo HTML

O arquivo pode conter qualquer HTML válido. Use o marcador
`[FOTO: nome-do-arquivo.jpg]` para indicar onde uma foto local
deve aparecer.

```html
<h2>O mercado imobiliário em Goiânia em 2025</h2>

<p>
  O setor imobiliário goiano encerrou 2024 com crescimento de 12%
  nas vendas, impulsionado principalmente pelos bairros do Setor
  Bueno e Jardim Goiás.
</p>

[FOTO: grafico-crescimento-2024.png]

<h2>Bairros em destaque</h2>

<p>
  Entre os bairros com maior valorização estão o Setor Marista
  e o Parque Amazônia, que registraram alta de 18% no preço
  médio do metro quadrado.
</p>

[FOTO: mapa-bairros-valorizados.jpg]

<p>
  Para o corretor que atua nessa região, entender esse movimento
  é essencial para orientar bem o cliente.
</p>

<h2>O que esperar de 2025</h2>

<p>
  Com a queda gradual da Selic, especialistas projetam que...
</p>
```

---

## O que o script faz com as fotos

Para cada `[FOTO: arquivo.jpg]`:

1. Lê o arquivo de `scripts/post-images/arquivo.jpg`
2. Faz upload para o R2 em: `blog/{timestamp}-arquivo.jpg`
3. Substitui o marcador por:
   ```html
   <img src="https://pub-xxx.r2.dev/blog/1751000000000-arquivo.jpg"
        alt="arquivo.jpg"
        style="max-width:100%;border-radius:8px;margin:16px 0" />
   ```

A mesma imagem referenciada mais de uma vez é enviada uma
única vez — o URL é reutilizado.

---

## Perguntas feitas no terminal

| Campo      | Obrigatório | Observação                                            |
|------------|:-----------:|-------------------------------------------------------|
| Título     | ✓           | Aparece como `<h1>` na página do post                 |
| Slug       | ✓           | Sugerido a partir do título, pode ser editado         |
| Resumo     | ✓           | 1–2 frases, aparece no card da listagem `/blog`       |
| Categoria  | —           | Mercado / Financiamento / Bairros / Outro             |
| Capa       | —           | Nome do arquivo em `scripts/post-images/`, vira URL   |

---

## Resultado

O post é inserido com `publicado = true` e fica disponível em:

- `/blog` — aparece na listagem
- `/blog/[slug]` — página completa
- `/admin/blog` — editável e excluível normalmente
