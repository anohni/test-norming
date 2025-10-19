// ============================================================================
// MAIN.JS — Versão binária (Sim/Não) para “A narrativa descreve um único evento?”
// ============================================================================

PennController.ResetPrefix(null);
// DebugOff(); // use DESCOMENTADO só na coleta final, COMENTE durante testes

Sequence(
  "PARTICIPANT_INFO",
  "WELCOME",
  "INSTRUCTIONS",
  "MAIN_START",
  rshuffle("main","check"),
  "SEND_RESULTS",
  "GOODBYE"
);

// ============================================================================
// TELAS ESTÁTICAS
// ============================================================================
newTrial("PARTICIPANT_INFO",
  newHtml("participant_info_html", `
    <div class='PennController' style='width: 70%; margin: auto;'>
      <h3>Identificação</h3>
      <p>Insira um ID (e-mail ou código) e clique em Continuar.</p>
    </div>
  `).print(),
  newTextInput("participant_id_input","")
    .css("margin-bottom","1em")
    .print()
    .log(),
  newButton("continue_button","Continuar").center().print()
    .wait( getTextInput("participant_id_input").test.text(/.+/) ),
  newVar("PARTICIPANT_ID").global().set( getTextInput("participant_id_input") )
);

newTrial("WELCOME",
  newHtml("welcome_html","welcome.html").print(), // vem de chunk_includes/
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
        <li><b>Não, mais de um evento</b>: há mudança de evento (por ex., mudança de tempo, lugar, objetivo).</li>
      </ul>
      <p>Algumas narrativas terão uma <b>verificação de atenção</b> (S/N).</p>
      <p>Pressione a <b>barra de espaço</b> para começar.</p>
    </div>
  `).print(),
  newKey("start_main"," ").wait()
);

newTrial("MAIN_START",
  newText("O experimento vai começar.").css("font-size","1.1em").center().print(),
  newTimer(1500).start().wait()
);

// ============================================================================
// TEMPLATE (LÊ stimuli.csv) E GERA OS TRIALS
// ============================================================================
GetTable().setGroupColumn("List"); // A/B/C/D ↔ grupos (0..3)

Template("stimuli.csv", row => {
  const label = (row.Type==="check") ? "check" : "main";

  return newTrial(label,

    // NARRATIVA (fonte maior)
    newText("narrativa", row.Narrative)
      .css("font-size","1.22em")
      .cssContainer({width:"70%", margin:"auto", "margin-bottom":"1.4em", "text-align":"left"})
      .print(),

    // BLOCO PRINCIPAL: pergunta binária (só para Type == "main")
    ...(row.Type === "main" ? [
      newText("pergunta_binaria", "A narrativa descreve um único evento?")
        .css("font-size","1.15em")
        .center()
        .print(),

      // ESCOLHA BINÁRIA (centralizada)
      newScale("evento_unico", "Sim, um único evento", "Não, mais de um evento")
        .radio()
        .center()
        .print()
        .log(),

      // BOTÃO CONTINUAR (centralizado e com validação)
      newButton("continuar","Continuar")
        .center()
        .css("margin-top","1.2em")
        .print()
        .wait( getScale("evento_unico").test.selected() )
    ] : [

      // BLOCO CHECK (S/N) — permanece como verificação de atenção
      newText("pergunta_check", `<p><b>Verificação:</b> ${row.CompQuestion}</p>`)
        .css("font-size","1.1em")
        .center()
        .print(),
      newText("instrucao_check", "Pressione S para 'Sim' ou N para 'Não'.")
        .center()
        .print(),
      newKey("resposta_check","SN").log().wait()
        .test.pressed( String(row.CompAnswer||"S").trim().toUpperCase() )
        .failure( newText("<p style='color:#b00'>Resposta incorreta registrada.</p>").center().print() ),

      newButton("continuar","Continuar")
        .center()
        .css("margin-top","1.2em")
        .print()
        .wait()
    ]),

  )
  // LOGS (inclui a resposta binária quando houver)
  .log("ParticipantID", getVar("PARTICIPANT_ID"))
  .log("ItemID", row.ItemID)
  .log("Condition", row.Condition)
  .log("Group", row.Group)
  .log("List", row.List)
  .log("Type", row.Type)
  .log("BinaryAnswer", row.Type === "main" ? getScale("evento_unico") : "")
  ;
});

// ============================================================================
// ENVIO E TELA FINAL
// ============================================================================
newTrial("SEND_RESULTS",
  SendResults(),
  newText("Por favor, aguarde enquanto salvamos os seus dados.").center().print(),
  newTimer(1500).start().wait()
);

newTrial("GOODBYE",
  newText("Obrigado por participar! Seus dados foram salvos. Você já pode fechar esta janela.")
    .css("font-size","1.05em")
    .center()
    .print(),
  newButton("Finalizar").center().print().wait()
);
