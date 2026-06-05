import logo from "../../images/logo.png";
import { formatDate } from "../lib/formatters";
import { getMedicalRecordSections, getMedicalRecordTypeLabel } from "../lib/medicalRecords";

export function MedicalRecordPDF({ patient, record }) {
  const sections = getMedicalRecordSections(record);

  return (
    <div
      style={{
        width: "794px",
        minHeight: "1123px",
        background: "#ffffff",
        color: "#0f172a",
        fontFamily: "Arial, Inter, sans-serif",
        padding: "48px"
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          borderBottom: "2px solid #d7e1e8",
          paddingBottom: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <img src={logo} alt="Cliion" style={{ width: "84px", height: "84px", objectFit: "contain" }} />
          <div>
            <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, letterSpacing: "0.02em" }}>Cliion</p>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#475569" }}>
              Documento clínico de prontuário
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: "13px", lineHeight: 1.7, color: "#334155" }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Clínica Cliion</p>
          <p style={{ margin: 0 }}>Av. Central, 245, Sala 08</p>
          <p style={{ margin: 0 }}>Natal - RN</p>
          <p style={{ margin: 0 }}>(84) 99999-0000</p>
        </div>
      </header>

      <section style={{ marginTop: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 700 }}>Prontuário do Paciente</h1>
        <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#475569" }}>
          Registro clínico exportado para acompanhamento, arquivo e compartilhamento profissional.
        </p>
      </section>

      <section
        style={{
          marginTop: "28px",
          border: "1px solid #d7e1e8",
          borderRadius: "18px",
          padding: "22px 24px",
          background: "#f8fafc"
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "18px" }}>
          <div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>
              Paciente
            </p>
            <p style={{ margin: "10px 0 0", fontSize: "21px", fontWeight: 700 }}>{patient.name}</p>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "#334155" }}>
              Telefone: {patient.phone || "-"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#334155" }}>
              E-mail: {patient.email || "-"}
            </p>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748b" }}>
              Informações do registro
            </p>
            <p style={{ margin: "10px 0 0", fontSize: "14px", color: "#334155" }}>
              <strong>Data:</strong> {formatDate(record.date)}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#334155" }}>
              <strong>Tipo:</strong> {getMedicalRecordTypeLabel(record.type)}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#334155" }}>
              <strong>Gerado em:</strong> {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "30px" }}>
        <div
          style={{
            border: "1px solid #d7e1e8",
            borderRadius: "18px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              background: "#0f766e",
              color: "#ffffff"
            }}
          >
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.86 }}>
              Tipo de prontuário
            </p>
            <h2 style={{ margin: "10px 0 0", fontSize: "24px", fontWeight: 700 }}>
              {getMedicalRecordTypeLabel(record.type)}
            </h2>
          </div>

          <div style={{ padding: "26px 24px" }}>
            {sections.length ? (
              <div style={{ display: "grid", gap: "22px" }}>
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0f172a",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #e2e8f0"
                      }}
                    >
                      {section.title}
                    </h3>
                    <p
                      style={{
                        margin: "12px 0 0",
                        fontSize: "14px",
                        lineHeight: 1.8,
                        color: "#334155",
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {section.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                Este prontuário ainda não possui seções preenchidas.
              </p>
            )}
          </div>
        </div>
      </section>

      <footer
        style={{
          marginTop: "44px",
          paddingTop: "24px",
          borderTop: "1px solid #d7e1e8",
          display: "grid",
          gap: "18px"
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
          Documento gerado automaticamente em {new Date().toLocaleDateString("pt-BR")}.
        </p>

        <div style={{ marginTop: "22px" }}>
          <div style={{ width: "260px", borderTop: "1px solid #94a3b8", paddingTop: "10px", fontSize: "13px", color: "#334155" }}>
            Assinatura do profissional
          </div>
        </div>
      </footer>
    </div>
  );
}
