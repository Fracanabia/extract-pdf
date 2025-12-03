import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Configuração do Worker para a versão 3.x.x
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface PDFResult {
  fileName: string;
  pageNumber: number;
  referencia: string;
  totalVencimentos: string;
}

export const SP_ESTADO: React.FC = () => {
  const [results, setResults] = useState<PDFResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    const extractedData: PDFResult[] = [];

    for (const file of Array.from(files)) {
      const pageResults = await extractTextFromPDF(file);
      extractedData.push(...pageResults);
    }

    setResults(extractedData);
    setLoading(false);
  };

  const extractTextFromPDF = (file: File): Promise<PDFResult[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) {
          reject("Erro ao ler o arquivo.");
          return;
        }

        const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
        try {
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          const pageResults: PDFResult[] = [];

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const text = content.items.map((item) => (item as any).str).join(" ");           
            console.log("🚀 ~ reader.onload= ~ text:", text)

            const referenciaRegex = /Data Pagamento\s+(\d{2}\/\d{4})/;
            const totalVencimentosRegex = /Total Vencimentos:\s+([\d.]+,\d{2})/;

            const referenciaMatch = text.match(referenciaRegex);
            const totalVencimentosMatch = text.match(totalVencimentosRegex);

            pageResults.push({
              fileName: file.name,
              pageNumber: i,
              referencia: referenciaMatch ? referenciaMatch[1] : "Não encontrado",
              totalVencimentos: totalVencimentosMatch ? totalVencimentosMatch[1] : "Não encontrado",
            });
          }

          resolve(pageResults);
        } catch (err) {
          reject(`Erro ao processar o PDF: ${err}`);
        }
      };

      reader.onerror = (err) => reject(`Erro ao carregar o arquivo: ${err}`);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleCopyToClipboard = () => {
    // Filtrar apenas os resultados com valores encontrados
    const filteredResults = results.filter((result) => result.totalVencimentos !== "Não encontrado");
    
    // Criar o texto a ser copiado
    const textToCopy = filteredResults
      .map((result) => `${result.referencia} ${result.totalVencimentos}`)
      .join("\n");
  
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Usar a API Clipboard se disponível
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          alert("Texto copiado para a área de transferência!");
        })
        .catch(() => {
          alert("Erro ao copiar o texto para a área de transferência.");
        });
    } else {
      // Fallback para navegadores antigos
      const tempTextArea = document.createElement("textarea");
      tempTextArea.value = textToCopy;
      tempTextArea.style.position = "absolute";
      tempTextArea.style.left = "-9999px"; // Esconde fora da tela
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      try {
        document.execCommand("copy");
        alert("Texto copiado para a área de transferência!");
      } catch {
        alert("Erro ao copiar o texto para a área de transferência.");
      }
      document.body.removeChild(tempTextArea); // Remover o elemento temporário
    }
  };
  
  
  

  return (
    <div>
      <h2>Extrator de Campos de PDFs</h2>
      <h3>GOVERNO DO ESTADO DE SÃO PAULO</h3>
      <h3> Departamento de Despesa de Pessoal do Estado</h3>
      <h3> Demonstrativo de Pagamento</h3>
      <input type="file" accept="application/pdf" multiple onChange={handlePDFUpload} />
      {loading && <p>Processando...</p>}
      <div style={{ marginTop: 16 }}>
        <table style={{ borderCollapse: "collapse", width: "100%", textAlign: "left" }} border={1}>
          <caption style={{ textAlign: "left", captionSide: "top" }}>Resultados:</caption>
          <thead>
            <tr>
              <th>Arquivo</th>
              <th>Página</th>
              <th>Referência</th>
              <th>Total de Vencimentos</th>
            </tr>
          </thead>
          <tbody>
            {results
              .filter((result) => result.totalVencimentos !== "Não encontrado")
              .map((result, index) => (
                <tr key={index}>
                  <td>{result.fileName}</td>
                  <td>{result.pageNumber}</td>
                  <td>{result.referencia}</td>
                  <td>{result.totalVencimentos}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <div style={{ marginTop: 20 }}>
          <h3>Valores extraídos:</h3>
          <textarea
            readOnly
            style={{ width: "100%", height: "150px", marginBottom: "10px" }}
            value={results
              .filter((result) => result.totalVencimentos !== "Não encontrado")
              .map((result) => `${result.referencia} ${result.totalVencimentos}`)
              .join("\n")}
          />
          <button onClick={handleCopyToClipboard}>Copiar para a área de transferência</button>
        </div>
      </div>
    </div>
  );
};
