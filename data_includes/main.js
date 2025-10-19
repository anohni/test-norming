// =============================================================================
// PARTE 3: TEMPLATE (LÊ stimuli.csv) E GERA OS TRIALS
// =============================================================================
GetTable().setGroupColumn("List"); // A/B/C/D ↔ grupos (0..3)

Template("stimuli.csv", row => {
  const label = (row.Type==="check") ? "check" : "main";

  return newTrial(label,

    // NARRATIVA (maior e legível)
    newText("narrativa", row.Narrative)
      .cssContainer({
        width: "70%", margin: "auto",
        "font-size": "1.5em", "line-height": "1.6",
        "text-align": "left", "margin-bottom": "1.6em"
      })
      .print(),

    ...(row.Type === "main" ? [

      // -------------------------
      // Q1 — EVENTO (binária)
      // -------------------------
      newText("q_evento", "A narrativa descreve um único evento?")
        .css({"font-size":"1.25em","text-align":"center","margin":"0.4em 0"})
        .bold()
        .print(),

      // Use opções curtas no Scale e deixe a explicação longa para as instruções
      newScale("evento_unico", "Sim", "Não")
        .radio()
        .labelsPosition("right")   // garante rótulos ao lado dos círculos
        .css({"font-size":"1.15em"})
        .center()
        .print()
        .log(),                    // registra “Sim” ou “Não”

      // -------------------------
      // Q2 — NATURALIDADE (Likert 1–7)
      // -------------------------
      newText("q_nat", "A narrativa soa natural?")
        .css({"font-size":"1.25em","text-align":"center","margin":"1.0em 0 0.2em 0"})
        .bold()
        .print(),

      newScale("escala_naturalidade", 7)
        .before( newText("Pouco natural").css("font-size","1.05em") )
        .after(  newText("Muito natural").css("font-size","1.05em") )
        .labelsPosition("top")
        .css({"font-size":"1.15em"})
        .center()
        .print()
        .log(),

      // Botão CONTINUAR centralizado e com validação das duas respostas
      newButton("continuar","Continuar")
        .css({"margin-top":"1.4em","font-size":"1.1em"})
        .center()
        .print()
        .wait(
          getScale("evento_unico").test.selected()
            .and( getScale("escala_naturalidade").test.selected() )
        )

    ] : [

      // -------------------------
      // TRIALS DE CHECK (S/N)
      // -------------------------
      newText("pergunta_check", `<p><b>Verificação:</b> ${row.CompQuestion}</p>`)
        .css({"font-size":"1.15em","text-align":"center"}).print(),
      newText("instrucao_check", "Pressione S para 'Sim' ou N para 'Não'.")
        .css({"text-align":"center"}).print(),
      newKey("resposta_check","SN").log().wait()
        .test.pressed( String(row.CompAnswer||"S").trim().toUpperCase() )
        .failure( newText("<p style='color:#b00;text-align:center'>Resposta incorreta registrada.</p>").print() ),

      newButton("continuar","Continuar")
        .css({"margin-top":"1.2em","font-size":"1.1em"})
        .center()
        .print()
        .wait()
    ]),

  )
  // LOGS
  .log("ParticipantID", getVar("PARTICIPANT_ID"))
  .log("ItemID", row.ItemID)
  .log("Condition", row.Condition)
  .log("Group", row.Group)
  .log("List", row.List)
  .log("Type", row.Type)
  .log("BinaryAnswer", row.Type === "main" ? getScale("evento_unico") : "")
  .log("Naturalidade", row.Type === "main" ? getScale("escala_naturalidade") : "");
});
