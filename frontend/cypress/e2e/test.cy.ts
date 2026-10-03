describe("Fluxo demonstrativo de atendimento", () => {
  it("emite, chama, apresenta no painel e finaliza", () => {
    cy.visit("/totem");
    cy.contains("button", "Atendimento prioritário").click();
    cy.contains("Pronto. Agora é só aguardar.").should("be.visible");
    cy.get(".ticket-number")
      .invoke("text")
      .then((number) => {
        cy.contains("nav a", "Atendimento").click();
        cy.contains("button", "Chamar próxima senha").click();
        cy.contains("button", "Chamar novamente").click();
        cy.contains("button", "Cliente não compareceu").should("be.visible");
        cy.contains("nav a", "Painel").click();
        cy.get(".call-display")
          .should("contain", number)
          .and("contain", "Última chamada");
        cy.get(".history li").should("have.length", 2);
        cy.contains("nav a", "Atendimento").click();
        cy.contains("button", "Iniciar atendimento").click();
        cy.contains("button", "Finalizar atendimento").click();
        cy.contains("button", "Chamar próxima senha").should("be.disabled");
      });
  });
});
