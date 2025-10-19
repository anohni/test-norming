// =============================================================================
// PARTE 1: CONFIGURAÇÃO GERAL E SEQUÊNCIA DE TELAS
// =============================================================================
PennController.ResetPrefix(null);
DebugOff(); // Lembre-se de comentar esta linha durante os testes

Sequence(
  "PARTICIPANT_INFO",
  "WELCOME",
  "INSTRUCTIONS",
  "MAIN_START",
  rshuffle("main","check"),   // Embaralha os trials principais e de verificação
  "SEND_RESULTS",
  "GOODBYE"
);

// Dispara o envio de resultados quando a label é alcançada
SendResults("SEND_RESULTS");

// =============================================================================
// PARTE 2: TELAS ESTÁTICAS
// =============================================================================
newTrial("PARTICIPANT_INFO",
  newHtml("participant_info_html", `
    <div class='PennController' style='width: 70%; margin: auto;'>
      <h3>Identificação</h3>
      <p>Insira um ID (e-mail ou código) e clique em Continuar.</p>
    </div>
  `).print(),
  newTextInput("participant_id_input","").css("margin-bottom","1em").print().log(),
  newButton("continue_button","Continuar").print()
    .wait( getTextInput("participant_id_input").test.text(/.+/) ),
  newVar("PARTICIPANT_ID").global().set( getTextInput("participant_id_input") )
);

newTrial("WELCOME",
  newHtml("welcome_html","welcome.html").print(), // Carrega de chunk_includes/
  newButton("Aceito e desejo participar").print().wait()
);

newTrial("INSTRUCTIONS",
  newHtml("instructions_html", `
    <div class='PennController' style='width: 70%; margin: auto; text-align: left;'>
      <h3>Instruções</h3>
      <p>Você lerá narrativas curtas. Após cada uma, faça dois julgamentos (1–7):</p>
      <ol><li><b>Coesão</b></li><li><b>Naturalidade</b></li></ol>
      <p>Às vezes haverá uma <b>verificação</b> de atenção (S/N).</p>
      <p>Pressione a <b>barra de espaço</b> para começar.</p>
    </div>
  `).print(),
  newKey("start_main"," ").wait()
);

newTrial("MAIN_START",
  newText("O experimento vai começar.").print(),
  newTimer(1500).start().wait()
);

// =============================================================================
// PARTE 3: TEMPLATE (LÊ stimuli.csv) E GERA OS TRIALS
// =============================================================================
GetTable().setGroupColumn("List"); // A/B/C/D controlam o contrabalanceamento

Template("stimuli.csv", row => { // Carrega de chunk_includes/
  const label = (row.Type==="check") ? "check" : "main";
  return newTrial(label,
    newText("narrativa", row.Narrative)
      .cssContainer({width:"70%", margin:"auto", "font-size":"1.2em","margin-bottom":"2em","text-align":"left"})
      .print(),

    newText("pergunta1", row.Question1).bold().print(),
    newScale("escala_coesao",7).before(newText("Pouco coeso")).after(newText("Muito coeso"))
      .labelsPosition("top").print().log(),

    newText("pergunta2", row.Question2).bold().css("margin-top","2em").print(),
    newScale("escala_naturalidade",7).before(newText("Pouco natural")).after(newText("Muito natural"))
      .labelsPosition("top").print().log(),

    // Adiciona a verificação apenas se Type=="check"
    ...(row.Type==="check" ? [
      newText("pergunta_check", `<p><b>Verificação:</b> ${row.CompQuestion}</p>`).print(),
      newText("instrucao_check", "Pressione S para 'Sim' ou N para 'Não'.").print(),
      newKey("resposta_check","SN").log().wait()
        .test.pressed( String(row.CompAnswer||"S").trim().toUpperCase() )
        .failure( newText("<p style='color:#b00'>Resposta incorreta registrada.</p>").print() )
    ] : []),

    newButton("continuar","Continuar").css("margin-top","2em").print()
      .wait( getScale("escala_coesao").test.selected()
        .and( getScale("escala_naturalidade").test.selected() ) )
  )
  .log("ParticipantID", getVar("PARTICIPANT_ID"))
  .log("ItemID", row.ItemID)
  .log("Condition", row.Condition)
  .log("Group", row.Group)
  .log("List", row.List)
  .log("Type", row.Type);
});

// =============================================================================
// PARTE 4: ENVIO E TELA FINAL
// =============================================================================
newTrial("SEND_RESULTS",
  newText("Por favor, aguarde enquanto salvamos os seus dados.").print(),
  newTimer(2000).start().wait()
);

newTrial("GOODBYE",
  newText("Obrigado por participar! Seus dados foram salvos. Você já pode fechar esta janela.")
    .print(),
  newButton("Finalizar").print().wait()
);
