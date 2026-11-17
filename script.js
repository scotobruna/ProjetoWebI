function recuperarRegistros(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function persistir(chave, registros) {
    localStorage.setItem(chave, JSON.stringify(registros));
}

let objetos = recuperarRegistros("objetos");
let linhas = recuperarRegistros("linhas");
let devolucoes = recuperarRegistros("devolucoes");

function proximoId(registros) {
    let id = 1;

    registros.forEach(function(registro) {
        if (registro.id >= id) {
            id = registro.id + 1;
        }
    });

    return id;
}

function adicionarObjeto(descricao, categoria, dataEncontrado, linhaId, status) {
    let novoObjeto = {
        id: proximoId(objetos),
        descricao: descricao,
        categoria: categoria,
        dataEncontrado: dataEncontrado,
        linhaId: Number(linhaId),
        status: status
    };

    objetos.push(novoObjeto);
    persistir("objetos", objetos);
}

function listarObjetosNaTabela() {
    let tabela = document.getElementById("tabelaObjetos");

    if (tabela) {
        tabela.innerHTML = "";

        objetos.forEach(function(objeto) {
            tabela.innerHTML += `
                <tr>
                    <td>${objeto.id}</td>
                    <td>${objeto.descricao}</td>
                    <td>${objeto.categoria}</td>
                    <td>${objeto.dataEncontrado || "Não informada"}</td>
                    <td>${objeto.status}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarObjeto(${objeto.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="excluirObjeto(${objeto.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }
}

function adicionarLinha(numero, identificacao) {
    let novaLinha = {
        id: proximoId(linhas),
        numero: numero,
        identificacao: identificacao
    };

    linhas.push(novaLinha);
    persistir("linhas", linhas);
}

function listarLinhasNaTabela() {
    let tabela = document.getElementById("tabelaLinhas");

    if (tabela) {
        tabela.innerHTML = "";

        linhas.forEach(function(linha) {
            tabela.innerHTML += `
                <tr>
                    <td>${linha.id}</td>
                    <td>${linha.numero}</td>
                    <td>${linha.identificacao}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarLinha(${linha.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="excluirLinha(${linha.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }
}

function adicionarDevolucao(objetoId, dataDevolucao, situacao) {
    let novaDevolucao = {
        id: proximoId(devolucoes),
        objetoId: Number(objetoId),
        dataDevolucao: dataDevolucao,
        situacao: situacao
    };

    devolucoes.push(novaDevolucao);
    persistir("devolucoes", devolucoes);
}

function listarDevolucoesNaTabela() {
    let tabela = document.getElementById("tabelaDevolucoes");

    if (tabela) {
        tabela.innerHTML = "";

        devolucoes.forEach(function(devolucao) {
            tabela.innerHTML += `
                <tr>
                    <td>${devolucao.id}</td>
                    <td>${devolucao.objetoId}</td>
                    <td>${devolucao.dataDevolucao || "Não informada"}</td>
                    <td>${devolucao.situacao}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarDevolucao(${devolucao.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="excluirDevolucao(${devolucao.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }
}

function abrirEdicao(titulo, campos, valores, salvar) {
    let modalAntigo = document.getElementById("modalEdicao");

    if (modalAntigo) {
        modalAntigo.remove();
    }

    let conteudo = "";

    campos.forEach(function(campo, i) {
        conteudo += `
            <div class="mb-3">
                <label class="form-label">${campo.label}</label>
                <input type="${campo.tipo}" id="campo${i}" class="form-control" value="${valores[i] || ""}" required>
            </div>
        `;
    });

    document.body.innerHTML += `
        <div class="modal fade" id="modalEdicao" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">${titulo}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>

                    <form id="formEdicao">
                        <div class="modal-body">
                            ${conteudo}
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar alterações</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    let modalElemento = document.getElementById("modalEdicao");
    let modal = new bootstrap.Modal(modalElemento);

    modalElemento.addEventListener("hidden.bs.modal", function() {
        modalElemento.remove();
    });

    document.getElementById("formEdicao").addEventListener("submit", function(event) {
        event.preventDefault();

        let dados = [];

        campos.forEach(function(campo, i) {
            dados.push(document.getElementById("campo" + i).value);
        });

        salvar(dados);
        modal.hide();
    });

    modal.show();
}

function editarObjeto(id) {
    let objeto = objetos.find(function(registro) {
        return registro.id == id;
    });

    abrirEdicao("Editar objeto", [
        {label: "Descrição", tipo: "text"},
        {label: "Categoria", tipo: "text"},
        {label: "Data encontrada", tipo: "date"},
        {label: "Linha", tipo: "number"},
        {label: "Status", tipo: "text"}
    ], [
        objeto.descricao,
        objeto.categoria,
        objeto.dataEncontrado,
        objeto.linhaId,
        objeto.status
    ], function(dados) {
        objeto.descricao = dados[0];
        objeto.categoria = dados[1];
        objeto.dataEncontrado = dados[2];
        objeto.linhaId = Number(dados[3]);
        objeto.status = dados[4];

        persistir("objetos", objetos);
        listarObjetosNaTabela();
    });
}

function excluirObjeto(id) {
    if (confirm("Deseja excluir este objeto?")) {
        let indice = objetos.findIndex(function(objeto) {
            return objeto.id == id;
        });

        objetos.splice(indice, 1);
        persistir("objetos", objetos);
        listarObjetosNaTabela();
    }
}

function editarLinha(id) {
    let linha = linhas.find(function(registro) {
        return registro.id == id;
    });

    abrirEdicao("Editar linha", [
        {label: "Número da linha", tipo: "text"},
        {label: "Identificação", tipo: "text"}
    ], [
        linha.numero,
        linha.identificacao
    ], function(dados) {
        linha.numero = dados[0];
        linha.identificacao = dados[1];

        persistir("linhas", linhas);
        listarLinhasNaTabela();
    });
}

function excluirLinha(id) {
    if (confirm("Deseja excluir esta linha?")) {
        let indice = linhas.findIndex(function(linha) {
            return linha.id == id;
        });

        linhas.splice(indice, 1);
        persistir("linhas", linhas);
        listarLinhasNaTabela();
    }
}

function editarDevolucao(id) {
    let devolucao = devolucoes.find(function(registro) {
        return registro.id == id;
    });

    abrirEdicao("Editar devolução", [
        {label: "Objeto", tipo: "number"},
        {label: "Data da devolução", tipo: "date"},
        {label: "Situação", tipo: "text"}
    ], [
        devolucao.objetoId,
        devolucao.dataDevolucao,
        devolucao.situacao
    ], function(dados) {
        devolucao.objetoId = Number(dados[0]);
        devolucao.dataDevolucao = dados[1];
        devolucao.situacao = dados[2];

        persistir("devolucoes", devolucoes);
        listarDevolucoesNaTabela();
    });
}

function excluirDevolucao(id) {
    if (confirm("Deseja excluir esta devolução?")) {
        let indice = devolucoes.findIndex(function(devolucao) {
            return devolucao.id == id;
        });

        devolucoes.splice(indice, 1);
        persistir("devolucoes", devolucoes);
        listarDevolucoesNaTabela();
    }
}

let formObjeto = document.getElementById("formObjeto");

if (formObjeto) {
    formObjeto.addEventListener("submit", function(event) {
        event.preventDefault();

        adicionarObjeto(
            document.getElementById("descricao").value,
            document.getElementById("categoria").value,
            document.getElementById("dataEncontrado").value,
            document.getElementById("linhaId").value,
            document.getElementById("status").value
        );

        listarObjetosNaTabela();
        formObjeto.reset();
    });
}

let formLinha = document.getElementById("formLinha");

if (formLinha) {
    formLinha.addEventListener("submit", function(event) {
        event.preventDefault();

        adicionarLinha(
            document.getElementById("numero").value,
            document.getElementById("identificacao").value
        );

        listarLinhasNaTabela();
        formLinha.reset();
    });
}

let formDevolucao = document.getElementById("formDevolucao");

if (formDevolucao) {
    formDevolucao.addEventListener("submit", function(event) {
        event.preventDefault();

        adicionarDevolucao(
            document.getElementById("objetoId").value,
            document.getElementById("dataDevolucao").value,
            document.getElementById("situacao").value
        );

        listarDevolucoesNaTabela();
        formDevolucao.reset();
    });
}

listarObjetosNaTabela();
listarLinhasNaTabela();
listarDevolucoesNaTabela();