(function () {
    var tabla = document.getElementById('tabla-productos');
    var filasBody = tabla.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    var totalSinDescEl = document.getElementById('total-sin-desc');
    var totalDescEl    = document.getElementById('total-descuento');
    var totalFinalEl   = document.getElementById('total-final');

    var cuponValido = false;

    function calcularFila(tr) {
        var precio = parseFloat(tr.getAttribute('data-precio')) || 0;
        var promo  = tr.getAttribute('data-promo') || 'NINGUNA';

        var chk = tr.getElementsByClassName('chk')[0];
        var qtyInput = tr.getElementsByClassName('qty')[0];

        var precioDescTd = tr.getElementsByClassName('precio-desc')[0];
        var subtotalTd   = tr.getElementsByClassName('subtotal')[0];

        var cantidad = 0;
        if (chk && chk.checked) {
            var q = parseInt(qtyInput.value, 10);
            if (isNaN(q) || q < 1) { q = 1; qtyInput.value = 1; }
            cantidad = q;
        }

        var base = precio * cantidad;
        var descFila = 0;

        if (promo === '50SEGUNDO' && cantidad >= 2) {
            var pares = Math.floor(cantidad / 2);
            descFila = pares * (precio * 0.5);
        } else if (promo === '3X2' && cantidad >= 3) {
            var trios = Math.floor(cantidad / 3);
            descFila = trios * precio;
        }

        var subtotalConPromo = base - descFila;

        if (cantidad > 0) {
            var precioPromedio = subtotalConPromo / cantidad;
            precioDescTd.textContent = precioPromedio.toFixed(2);
            subtotalTd.textContent = subtotalConPromo.toFixed(2);
        } else {
            precioDescTd.textContent = '-';
            subtotalTd.textContent = '-';
        }

        return { base: base, descFila: descFila, subtotal: subtotalConPromo };
    }

    function recalcularTodo() {
        var i = 0;
        var totalBase = 0;
        var totalDescFilas = 0;

        while (i < filasBody.length) {
            var res = calcularFila(filasBody[i]);
            totalBase += res.base;
            totalDescFilas += res.descFila;
            i = i + 1;
        }

        var aplicaUmbral = totalBase >= 30000;
        var aplicaCupon  = cuponValido;

        var descGlobal = 0;
        if (aplicaUmbral || aplicaCupon) {
            descGlobal = (totalBase - totalDescFilas) * 0.10;
        }

        var totalFinal = totalBase - totalDescFilas - descGlobal;

        totalSinDescEl.textContent = totalBase.toFixed(2);
        totalDescEl.textContent    = "-" + (totalDescFilas + descGlobal).toFixed(2);
        totalFinalEl.textContent   = totalFinal.toFixed(2);
    }

    function enlazarEventos() {
        var i = 0;
        while (i < filasBody.length) {
            var tr = filasBody[i];
            var chk = tr.getElementsByClassName('chk')[0];
            var qty = tr.getElementsByClassName('qty')[0];

            if (chk) chk.addEventListener('change', recalcularTodo);
            if (qty) qty.addEventListener('input', recalcularTodo);

            i = i + 1;
        }

        var form = document.getElementById('form-cupon');
        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var codigo = document.getElementById('codigo').value.trim().toUpperCase();
                if (codigo === 'P4TAS10') cuponValido = true;
                else cuponValido = false;
                recalcularTodo();
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        enlazarEventos();
        recalcularTodo();
    });
})();
