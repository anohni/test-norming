// Reset do prefixo padrão do PennController
PennController.ResetPrefix(null);

// === CONFIGURAÇÕES GERAIS ===
const SHOW_SANITY = true;  // coloque false quando for rodar com participantes

// === SANITY CHECK ===
if (SHOW_SANITY) {
    newTrial("SANITY",
        newText("<h2>Resumo do CSV</h2>")
            .print()
        ,
        newVar("rowCount").set(v => GetTable("stimuli.csv").length).log(),
        newText("Aviso", "Se aparecer 'ROW_COUNT=0', o CSV não foi carregado corretamente.")
            .print()
        ,
        newButton("Continuar").print().wait()
    );
}

// === CARREGA O CSV E DEFINE CONTRABALANCEAMENTO ===
GetTable("stimuli.csv").setGroupColumn("List");

// === TRIALS PRINCIPAIS ===
Template("stimuli.csv", row =>
    newTrial("main",
        newText(row.Narrative)
            .css("font-size", "1.4em")
            .center()
            .print()
        ,
        newText("<br><br>A narrativa descreve um único evento?")
            .css("font-size", "1.2em")
            .print()
        ,
        newScale("EventQuestion", "Sim", "Não")
            .radio()
            .labelsPosition("right")
            .log()
            .print()
            .wait()
        ,
        newText("<br><br>A narrativa soa natural?")
            .css("font-size", "1.2em")
            .print()
        ,
        newScale("NaturalnessQuestion", "Sim", "Não")
            .radio()
            .labelsPosition("right")
            .log()
            .print()
            .wait()
        ,
        // Pergunta de atenção (se existir)
        newFunction(() => row.CompQuestion && row.CompQuestion.trim().length > 0).test.is(true)
            .success(
                newText("<br><br>" + row.CompQuestion)
                    .css("font-size", "1.2em")
                    .print()
                ,
                newScale("CompAnswer", "Sim", "Não")
                    .radio()
                    .labelsPosition("right")
                    .log()
                    .print()
                    .wait()
            )
    )
    .log("List", row.List)
    .log("ItemID", row.ItemID)
    .log("Condition", row.Condition)
    .log("Group", row.Group)
    .log("Type", row.Type)
);

// === FINAL ===
newTrial("end",
    newText("<h2>Obrigado pela sua participação!</h2>")
        .css("font-size", "1.5em")
        .print()
    ,
    newButton("Sair").print().wait()
);
