// ============================================================================
// MAIN.JS — Norming binário (Sim/Não) + SANITY ROBUSTO
// ============================================================================

PennController.ResetPrefix(null);
// DebugOff(); // só na coleta final

const SHOW_SANITY = true;     // deixe true enquanto testa

// ---------------------------------------------------------------------------
// Contadores e checagem de colunas (variáveis JS globais)
let MAIN_COUNT = 0;
let CHECK_COUNT = 0;
let ROW_COUNT = 0;
const REQUIRED_COLS = ["List","ItemID","Condition","Group","Type","Narrative","CompQuestion","CompAnswer"];
let missingCols = new Set(REQUIRED_COLS);
let firstRowSeen = false;

// LEITURA EXPLÍCITA DA TABELA (amarrado ao nome exato do arquivo)
GetTable("stimuli.csv").setGroupColumn("List");

// ---------------------------------------------------------------------------
// ORDEM DOS TRIALS
Sequence(
  "PARTICIPANT_INFO",
  "WELCOME",
  "INSTRUCTIONS",
  ...(SHOW_SANITY ? ["SANITY"] : []),
  "MAIN_START",
  rshuffle("main","check"),
  "SEND_RESULTS",
  "GOODBYE"
);

// ---------------------------------------------------------------------------
// TELAS ESTÁTICAS
newTrial("PARTICIPANT_INFO",
  newHtml("participant_info_html", `
    <div class='PennController' style='width: 70%; margin: auto;'>
      <h3>Identificação</h3>
      <p>Insira um ID (e-mail ou código) e clique em Continuar.</p>
    </div>
  `).print(),
  newTextInput("participant_id_input","").css("margin-bottom","1em").print().log(),
  newButton("continue_button","Continuar").center().print()
    .wait( getTextInput("participant_id_input").test.text(/.+/) ),
  newVar("PARTICIPANT_ID").global().set( getTextInput("participant_id_input") )
);

newTrial("WELCOME",
  newHtml("welcome_html","welcome.html").print(),
  newButton("Aceito e desejo participar").center().print().wait()
);

newTrial("INSTRUCTIONS",
  newHtml("instructions_html", `
    <div class='PennController' style='width: 70%; margin: auto; text-align: left; font-size: 1.05em;'>
      <h3>Instruções</h3>
      <p>Você lerá narrativas curtas. Em cada uma, responda:</p>
      <p style="margin: 0.8em 0;"><b>A narrativa descreve um único evento?</b></p>
      <ul>
        <li><b>Sim, um único evento</b>: as ações relatadas fazem parte do mesmo evento/situação contínua.</li>
        <li><b>Não, mais de um evento</b>: há mudança de evento (tempo, lugar, objetivo).</li>
      </ul>
      <p>Algumas narrativas terão uma <b>verificação de atenção</b> (S/N).</p>
      <p>Pressione a <b>barra de espaço</b> para começar.</p>
    </div>
  `).print(),
  newKey("start_main"," ").wait()
);

// ---------------------------------------------------------------------------
// TEMPLATE — gera trials e coleta estatísticas ao mesmo tempo
Template("stimuli.csv", row => {
  ROW_COUNT++;

  if (!firstRowSeen) {
    const keys = Object.keys(row);
    REQUIRED_COLS.forEach(col => { if (keys.includes(col)) missingCols.delete(col); });
    firstRowSeen = true;
  }

  const label = (String(row.Type).toLowerCase() === "check") ? "check" : "main";
  if (label === "main") MAIN_COUNT++; else CHECK_COUNT++;

  return newTrial(label,

    // NARRATIVA
    newText("narrativa", row.Narrative)
      .css("font-size","1.22em")
      .cssContainer({width:"70%", margin:"auto", "margin-bottom":"1.4em", "text-align":"left"})
      .print(),

    // BLOCO PRINCIPAL (binário) — apenas quando Type == "main"
    ...(label === "main"
      ? [
          newText("pergunta_binaria", "A narrativa descreve um único evento?")
            .css("font-size","1.15em").center().print(),

          newScale("evento_unico", "Sim, um único evento", "Não, mais de um evento")
            .radio().center().print().log(),

          newButton("continuar","Continuar")
            .center().css("margin-top","1.2em").print()
            .wait( getScale("evento_unico").test.selected() )
        ]
      : [
          // BLOCO CHECK (S/N)
          newText("pergunta_check", `<p><b>Verificação:</b> ${row.CompQuestion||""}</p>`)
            .css("font-size","1.1em").center().print(),

          newText("instrucao_check", "Pressione S para 'Sim' ou N para 'Não'.").center().print(),

          newKey("resposta_check","SN").log().wait()
            .test.pressed( String((row.CompAnswer||"S")).trim().toUpperCase() )
            .failure( newText("<p style='color:#b00'>Resposta incorreta registrada.</p>").center().print() ),

          newButton("continuar","Continuar").center().css("margin-top","1.2em").print().wait()
        ]
    )
  )
  // LOGS
  .log("ParticipantID", getVar("PARTICIPANT_ID"))
  .log("ItemID", row.ItemID)
  .log("Condition", row.Condition)
  .log("Group", row.Group)
  .log("List", row.List)
  .log("Type", row.Type)
  .log("BinaryAnswer", label === "main" ? getScale("evento_unico") : "")
  ;
});

// ---------------------------------------------------------------------------
// SANITY — mostra contagens e bloqueia se não houver tabela
if (SHOW_SANITY) {
  newTrial("SANITY",
    (function(){
      const issues = [];
      if (ROW_COUNT === 0) issues.push("CSV vazio ou não carregado (ROW_COUNT=0). Verifique nome e local: Resources → stimuli.csv.");
      const missing = Array.from(missingCols);
      if (missing.length > 0) issues.push("Colunas ausentes: " + missing.join(", "));
      if (MAIN_COUNT === 0) issues.push("Nenhum trial 'main' gerado.");
      // check opcional: if (CHECK_COUNT === 0) issues.push("Nenhum 'check' gerado.");

      const ok = issues.length === 0;
      const summary =
        `<div style="text-align:left; width:70%; margin:auto">
           <h3>Resumo do CSV</h3>
           <ul>
             <li>Linhas lidas (ROW_COUNT): <b>${ROW_COUNT}</b></li>
             <li>Trials main: <b>${MAIN_COUNT}</b></li>
             <li>Trials check: <b>${CHECK_COUNT}</b></li>
           </ul>
           ${ok ? `<p style="color:#070"><b>Nenhum problema crítico detectado.</b></p>`
               : `<p style="color:#b00"><b>Problemas:</b><br>${issues.map(x=>"- "+x).join("<br>")}</p>`}
           <p style="margin-top:1em">Dica: abra o painel <b>Debug → Tables</b> e verifique se <code>stimuli.csv</code> aparece e tem 180 linhas.</p>
         </div>`;
      return newText("sanity_html", summary).print();
    })(),
    newButton("Prosseguir").center().print()
      .wait( newFunction(()=> ROW_COUNT>0 && missingCols.size===0 && MAIN_COUNT>0 ).test.is(true) )
  );
}

// ---------------------------------------------------------------------------
// INÍCIO, ENVIO E FINAL
newTrial("MAIN_START",
  newText("O experimento vai começar.").css("font-size","1.1em").center().print(),
  newTimer(1500).start().wait()
);

newTrial("SEND_RESULTS",
  SendResults(),
  newText("Por favor, aguarde enquanto salvamos os seus dados.").center().print(),
  newTimer(1500).start().wait()
);

newTrial("GOODBYE",
  newText("Obrigado por participar! Seus dados foram salvos. Você já pode fechar esta janela.")
    .css("font-size","1.05em").center().print(),
  newButton("Finalizar").center().print().wait()
);
