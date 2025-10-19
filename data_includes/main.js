Template("stimuli.csv", row => {
  const label = (row.Type === "check") ? "check" : "main";

  return newTrial(
    label,

    // NARRATIVA
    newText("narrativa", row.Narrative)
      .css("font-size","1.22em")
      .cssContainer({width:"70%", margin:"auto", "margin-bottom":"1.4em", "text-align":"left"})
      .print(),

    // BLOCO PRINCIPAL (binário) — apenas quando Type == "main"
    ...(row.Type === "main"
      ? [
          newText("pergunta_binaria", "A narrativa descreve um único evento?")
            .css("font-size","1.15em")
            .center()
            .print(),

          newScale("evento_unico", "Sim, um único evento", "Não, mais de um evento")
            .radio()
            .center()
            .print()
            .log(),

          newButton("continuar","Continuar")
            .center()
            .css("margin-top","1.2em")
            .print()
            .wait( getScale("evento_unico").test.selected() )
        ]
      : [
          // BLOCO CHECK (S/N)
          newText("pergunta_check", `<p><b>Verificação:</b> ${row.CompQuestion}</p>`)
            .css("font-size","1.1em")
            .center()
            .print(),

          newText("instrucao_check", "Pressione S para 'Sim' ou N para 'Não'.")
            .center()
            .print(),

          newKey("resposta_check","SN").log().wait()
            .test.pressed( String(row.CompAnswer || "S").trim().toUpperCase() )
            .failure( newText("<p style='color:#b00'>Resposta incorreta registrada.</p>").center().print() ),

          newButton("continuar","Continuar")
            .center()
            .css("margin-top","1.2em")
            .print()
            .wait()
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
  .log("BinaryAnswer", row.Type === "main" ? getScale("evento_unico") : "");
});
