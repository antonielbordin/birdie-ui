
// BiDataTable.js
'use strict';

class BiDataTable {    
    constructor(idTable, options = { 
        renderJSON: null,
        showSearch: true,
        showSelect: true,
        showPaginate: true,
        selectionNumber: [5, 10, 20, 50],
        hideColumn: [],
        showHighlight: false,
        fixedTable: false,
        sortAnimate: true,
        showTfooter: true,
        removeColumnExport: [] }) {
        var _a, _b, _c, _d;
        this.headerDataTable = []; // header table to array
        this.rowDataTable = []; // get Table to json
        this.dataTable = [];
        this.dataSorted = [];
        this.dataToRender = [];
        this.pageSize = 5;
        this.assc = false;
        this.dataSearch = [];
        this.i = 0;
        this.controlDataArr = [];
        this.dataTableRaw = [];
        this.searchValue = '';
        this.listHiding = [];
        this.selectionNumber = [5, 10, 20, 50];
        this.selectElementString = '';
        this.showHighlight = false;
        this.listTypeDate = [];
        this.pageNow = 1;
        this.removeColumnExport = [];
        this.tableElement = document.getElementById(idTable);
        this.options = options;
        this.detectTyped();
        this.convertToJson();
        this.paginateRender();
        this.control();
        this.search();
        this.renderToHTML();
        this.paginateUpdate();
        if (options.renderJSON != null && options.hasOwnProperty('renderJSON')) {
            this.JSONinit(options.renderJSON);
        }
        if (!options.showSelect && options.hasOwnProperty('showSelect')) {
            (_a = document.getElementById('biSelectControl')) === null || _a === void 0 ? void 0 : _a.remove();
        }
        this.showHighlight = options === null || options === void 0 ? void 0 : options.showHighlight;
        if (options.fixedTable && options.hasOwnProperty('fixedTable')) {
            (_b = this.tableElement) === null || _b === void 0 ? void 0 : _b.classList.add("table_layout_fixed");
        }
        else {
            (_c = this.tableElement) === null || _c === void 0 ? void 0 : _c.classList.remove("table_layout_fixed");
        }
        if (!options.showSearch && options.hasOwnProperty('showSearch')) {
            (_d = document.getElementById('biSearchControl')) === null || _d === void 0 ? void 0 : _d.remove();
        }
        if (options.hideColumn != null && options.hasOwnProperty('hideColumn')) {
            this.listHiding = options.hideColumn;
            this.DoHide();
        }
        if (options.selectionNumber != null && options.hasOwnProperty('selectionNumber')) {
            this.selectionNumber = options.selectionNumber;
            this.changeSelect();
        }
        this.totalPages = this.divide().length;
    }
    detectTyped() {
        var _a;
        const getHead = (_a = this.tableElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('th');
        for (let z = 0; z < getHead.length; z++) {
            if (getHead[z].attributes['type-date']) {
                this.listTypeDate.push({
                    HeaderIndex: z,
                    dateVal: true
                });
            }
        }
    }
    changeSelect() {
        this.selectElementString = '';
        for (let x = 0; x < this.selectionNumber.length; x++) {
            this.selectElementString += `<option value="${this.selectionNumber[x]}">${this.selectionNumber[x]}</option>`;
        }
        let ElSelect = document.getElementById("biSelectControl");
        if (ElSelect) {
            ElSelect.innerHTML = this.selectElementString;
        }
        return this.selectElementString;
    }
    control() {
        const spanOne = document.createElement('span');
        spanOne.innerHTML = `
        <div class="bi-datatable-controls">
            <div class="bi-dtc-select">
                <div class="ctr-select">
                    <select id="biSelectControl">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
            <div class="bi-dtc-search">
                <div class="ctr-search">
                    <input type="text" id="biSearchControl" placeholder="Search">
                </div>
            </div>
        </div>
        `;
        this.tableElement.parentNode.insertBefore(spanOne, this.tableElement);
        this.tableElement.style.width = '100%';
        const changeValueSelected = (params) => {
            this.pageSize = params;
            this.i = 0;
            this.renderToHTML();
        };
        let selectEl = document.getElementById('biSelectControl');
        selectEl === null || selectEl === void 0 ? void 0 : selectEl.addEventListener('change', function () {
            changeValueSelected(this.value);
        });
        document.getElementById('biPaginator__NEXT__X').onclick = () => {
            this.nextItem();
            this.highlight(this.searchValue);
            this.DoHide();
        };
        document.getElementById('biPaginator__PREV__X').onclick = () => {
            this.prevItem();
            this.highlight(this.searchValue);
            this.DoHide();
        };
    }
    nextItem() {
        this.i = this.i + 1; // increase i by one
        this.i = this.i % this.divide().length; // if we've gone too high, start from `0` again
        this.controlDataArr = this.divide()[this.i]; // give us back the item of where we are now
        this.renderToHTML(this.controlDataArr);
        this.pageNow = this.i + 1;
    }
    prevItem() {
        if (this.i === 0) { // i would become 0
            this.i = this.divide().length; // so put it at the other end of the array
        }
        this.i = this.i - 1; // decrease by one
        this.pageNow = this.i + 1;
        this.controlDataArr = this.divide()[this.i]; // give us back the item of where we are now
        this.renderToHTML(this.controlDataArr);
    }
    paginateRender() {
        const paginator = ` 
        <div class="bi-datatable-paginator">
            <span id="biPaginator__PREV__X" class="bi-pg-prev">&laquo;</span>
            <div id="biPaginator__INFO" class="bi-pg-info"></div>
            <span id="biPaginator__NEXT__X" class="bi-pg-next">&raquo;</span>
        </div>
        `;
        const span = document.createElement('span');
        span.innerHTML = paginator;
        this.tableElement.parentNode.insertBefore(span, this.tableElement.nextSibling);
    }
    paginateUpdate() {
        if (document.getElementById('biPaginator__INFO') != null) {
            document.getElementById('biPaginator__INFO').innerHTML = `
            <span>Page ${this.i + 1} / ${this.divide().length} of ${(this.dataTable === undefined) ? 0 : this.dataTable.length} Entries</span>`;
        }
    }
    search() {
        var _a;
        this.dataSearch = this.dataTable;
        (_a = document.getElementById('biSearchControl')) === null || _a === void 0 ? void 0 : _a.addEventListener('input', (evt) => {
            this.searchValue = evt.target.value;
            this.dataTable = this.dataSearch.filter((element) => {
                for (let index = 0; index < this.headerDataTable.length; index++) {
                    const fg = element[this.headerDataTable[index]].toString().toLowerCase().includes(evt.target.value.toLowerCase());
                    if (fg) {
                        return fg;
                    }
                }
            });
            this.renderToHTML();
            this.i = 0;
            this.paginateUpdate();
            this.highlight(evt.target.value);
        });
    }
    convertToJson() {
        var _a, _b, _c;
        //get Header
        const getHead = (_a = this.tableElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('th');
        for (let v = 0; v < getHead.length; v++) {
            (_b = this.headerDataTable) === null || _b === void 0 ? void 0 : _b.push(getHead[v].textContent);
        }
        //get row data
        const getbody = (_c = this.tableElement) === null || _c === void 0 ? void 0 : _c.getElementsByTagName('tbody');
        for (let row = 0; row < ((getbody[0] === undefined) ? 0 : getbody[0].rows.length); row++) {
            const cellsD = [];
            for (let cellsIndex = 0; cellsIndex < getbody[0].rows[row].cells.length; cellsIndex++) {
                cellsD.push(getbody[0].rows[row].cells[cellsIndex].innerHTML);
            }
            this.rowDataTable.push(cellsD);
        }
        // to key value Json
        this.dataTable = this.rowDataTable.reduce((akumulasi, e) => {
            akumulasi.push(this.headerDataTable.reduce((x, y, i) => {
                x[y] = e[i];
                return x;
            }, {}));
            return akumulasi;
        }, []);
        this.dataTableRaw = this.dataTable;
        return this.dataTable;
    }
    divide() {
        const gh = [];
        const h = (typeof this.pageSize === "string") ? parseInt(this.pageSize) : this.pageSize;
        for (let i = 0; i < ((this.dataTable === undefined) ? 0 : this.dataTable.length); i += h) {
            gh.push(this.dataTable.slice(i, i + h));
        }
        return gh;
    }
    renderToHTML(option = null) {
        //clear 
        this.tableElement.innerHTML = '';
        // check if is sorted
        const checkIfSorted = (this.dataSorted === null || this.dataSorted === [] || this.dataSorted === undefined) ?
            this.divide()[0]
            : this.divide()[0];
        this.dataToRender = checkIfSorted;
        // HeaderDataTable To Element
        let header = '';
        let footer = '';
        for (let i = 0; i < this.headerDataTable.length; i++) {
            header += `<th style="cursor: pointer;" id="${this.headerDataTable[i]}_header" class="columns tablesorter-header">${this.headerDataTable[i]}</th>\n`;
            footer += `<th style="cursor: pointer;" id="${this.headerDataTable[i]}_footer" class="columns tablesorter-header">${this.headerDataTable[i]}</th>\n`;
        }
        // RowDataTable To Element
        const ifUndefinded = (this.dataToRender === undefined) ? 0 : this.dataToRender.length;
        let row = '';
        if (option === null) {
            for (let ___row = 0; ___row < ifUndefinded; ___row++) {
                let ToCell = '';
                for (let ___cell = 0; ___cell < this.headerDataTable.length; ___cell++) {
                    ToCell += `<td class="${this.headerDataTable[___cell]}__row">${this.dataToRender[___row][this.headerDataTable[___cell]]}</td>\n`;
                }
                row += `<tr>${ToCell}</tr>\n`;
            }
        } else {
            for (let ___row = 0; ___row < option.length; ___row++) {
                let ToCell = '';
                for (let ___cell = 0; ___cell < this.headerDataTable.length; ___cell++) {
                    ToCell += `<td class="${this.headerDataTable[___cell]}__row">${option[___row][this.headerDataTable[___cell]]}</td>\n`;
                }
                row += `<tr>${ToCell}</tr>\n`;
            }
            this.dataToRender = option;
        }
        // ====
        let ToEl = `<thead><tr>${header}</tr></thead><tbody>${row}</tbody>`;
        if (this.options.showTfooter) {
            ToEl += `<tfoot>${footer}</tfoot>`;
        }
        this.tableElement.innerHTML = ToEl;
        for (let n = 0; n < this.headerDataTable.length; n++) {
            const cv = document.getElementById(`${this.headerDataTable[n]}_header`);
            document.getElementById(`${this.headerDataTable[n]}_header`).style.opacity = '100%';
            cv.onclick = () => {
                this.sort(this.headerDataTable[n]);
                let GetElsHeaderList = document.getElementById(`${this.headerDataTable[n]}_header`);
                document.getElementById(`${this.headerDataTable[n]}_header`).style.opacity = '60%';
                if (this.assc) {
                    GetElsHeaderList.classList.remove('tablesorter-header-asc');
                    GetElsHeaderList.classList.add('tablesorter-header-desc');
                }
                else {
                    GetElsHeaderList.classList.remove('tablesorter-header-desc');
                    GetElsHeaderList.classList.add('tablesorter-header-asc');
                }
                //animate
                if (this.options.sortAnimate) {
                    const s = document.getElementsByClassName(`${this.headerDataTable[n]}__row`);
                    for (let j = 0; j < s.length; j++) {
                        setTimeout(() => s[j].classList.add('blink_me'), 21 * j);
                    }
                }
            };
        }
        this.paginateUpdate();
        this.DoHide();
    }
    /**
     *
     * @param column name column to sort
     * @returns show data shorted
     */
    sort(column) {
        const t0 = performance.now();
        function naturalCompare(a, b) {
            const ax = [];
            const bx = [];
            a.toString().replace(/(^\$|,)/g, '').replace(/(\d+)|(\D+)/g, function (_, $1, $2) { ax.push([$1 || Infinity, $2 || ""]); });
            b.toString().replace(/(^\$|,)/g, '').replace(/(\d+)|(\D+)/g, function (_, $1, $2) { bx.push([$1 || Infinity, $2 || ""]); });
            for (let index = 0; ax.length && bx.length; index++) {
                const an = ax.shift();
                const bn = bx.shift();
                const nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
                if (nn)
                    return nn;
            }
            return ax.length - bx.length;
        }
        const IndexHead = this.headerDataTable.indexOf(column);
        const listDated = this.listTypeDate.find(x => x.HeaderIndex === IndexHead);
        const isDate = (listDated === null || listDated === void 0 ? void 0 : listDated.HeaderIndex) === IndexHead;
        const data = this.dataTable;
        if (this.assc) {
            this.assc = !this.assc;
            if (!isDate) {
                data.sort((a, b) => {
                    return naturalCompare(a[column], b[column]);
                });
            }
            else {
                data.sort((a, b) => {
                    return Date.parse(a[column]) - Date.parse(b[column]);
                });
            }
        }
        else {
            this.assc = !this.assc;
            if (!isDate) {
                data.sort((a, b) => {
                    return naturalCompare(b[column], a[column]);
                });
            }
            else {
                data.sort((a, b) => {
                    return Date.parse(b[column]) - Date.parse(a[column]);
                });
            }
        }
        this.dataSorted = data;
        this.i = 0;
        this.renderToHTML();
        const t1 = performance.now();
        this.timeSort = Math.round((t1 - t0) / 1000 * 10000) / 10000;
        return this.dataSorted;
    }
    excludeColumnExport() {
        let dataTable = JSON.parse(JSON.stringify(this.dataTable));
        let exlude = this.options.removeColumnExport;
        let head = [...this.headerDataTable];
        for (let x = 0; x < exlude.length; x++) {
            let indexHead = head.indexOf(exlude[x]);
            if (indexHead > -1) {
                head.splice(indexHead, 1);
            }
        }
        for (let x = 0; x < dataTable.length; x++) {
            for (let n = 0; n < exlude.length; n++) {
                delete dataTable[x][exlude[n]];
            }
        }
        return {
            "header": head,
            "data": DataTable
        };
    }
    /**
     *
     * @param filename filename to download default is Export
     *
     */
    DownloadCSV(filename = 'Export') {
        let data = this.excludeColumnExport();
        let str = '';
        let hed = data.header.toString();
        str = hed + '\r\n';
        for (let i = 0; i < data.data.length; i++) {
            let line = '';
            for (const index in data.data[i]) {
                if (line != '')
                    line += ',';
                line += data.data[i][index];
            }
            str += line + '\r\n';
        }
        const element = document.createElement('a');
        element.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(str);
        element.target = '_blank';
        element.download = filename + '.csv';
        element.click();
    }
    /**
     *
     * @param filename filename to download default is Export
     *
     */
    DownloadJSON(filename = 'Export') {
        let data = this.excludeColumnExport();
        const element = document.createElement('a');
        element.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data.data));
        element.target = '_blank';
        element.download = filename + '.json';
        element.click();
    }
    /**
     *
     * @param text for highlighting text in table
     *
     */
    highlight(text) {
        var _a;
        if (this.showHighlight) {
            const getbody = (_a = this.tableElement) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('tbody');
            for (let row = 0; row < getbody[0].rows.length; row++) {
                for (let cellsIndex = 0; cellsIndex < getbody[0].rows[row].cells.length; cellsIndex++) {
                    let innerHTML = getbody[0].rows[row].cells[cellsIndex].innerHTML;
                    const index = innerHTML.indexOf(text);
                    if (index >= 0) {
                        innerHTML = innerHTML.substring(0, index) + "<span style='background-color: yellow;'>" + innerHTML.substring(index, index + text.length) + "</span>" + innerHTML.substring(index + text.length);
                        getbody[0].rows[row].cells[cellsIndex].innerHTML = innerHTML;
                        getbody[0].rows[row].cells[cellsIndex].classList.add(`${this.headerDataTable[cellsIndex].replace(/\s/g, '_')}__row`);
                    }
                }
            }
        }
    }
    /**
     *
     * @param PayLoad you json data to table
     *
     */
    JSONinit(PayLoad = []) {
        this.headerDataTable = [];
        for (const key in PayLoad[0]) {
            this.headerDataTable.push(key);
        }
        this.dataTable = PayLoad;
        this.dataSearch = PayLoad;
        this.renderToHTML();
    }
    HideCol(column) {
        const Classes = document.getElementsByClassName(`${column}__row`);
        for (let O = 0; O < Classes.length; O++) {
            Classes[O].style.display = "none";
        }
        let ColmnHeader = document.getElementById(`${column}_header`);
        let ColmnFotter = document.getElementById(`${column}_footer`);
        if (ColmnHeader) {
            ColmnHeader.style.display = "none";
            if (ColmnFotter) {
                ColmnFotter.style.display = "none";
            }
        }
    }
    ShowCol(column) {
        const Classes = document.getElementsByClassName(`${column}__row`);
        for (let O = 0; O < Classes.length; O++) {
            Classes[O].style.display = "";
        }
        let ColmnHeader = document.getElementById(`${column}_header`);
        let ColmnFotter = document.getElementById(`${column}_footer`);
        if (ColmnHeader) {
            ColmnHeader.style.display = "";
            if (ColmnFotter) {
                ColmnFotter.style.display = "";
            }
        }
    }
    DoHide() {
        const GetHeadArr = this.headerDataTable;
        const ListOftrutc = [];
        for (let T = 0; T < this.headerDataTable.length; T++) {
            ListOftrutc.push(true);
        }
        for (let O = 0; O < this.listHiding.length; O++) {
            const Index = GetHeadArr.indexOf(this.listHiding[O]);
            if (Index > -1) {
                ListOftrutc[Index] = false;
            }
        }
        const IndexTrue = [];
        const IndexFalse = [];
        for (let U = 0; U < ListOftrutc.length; U++) {
            if (ListOftrutc[U]) {
                IndexTrue.push(U);
            }
            if (!ListOftrutc[U]) {
                IndexFalse.push(U);
            }
        }
        for (let V = 0; V < IndexTrue.length; V++) {
            this.ShowCol(GetHeadArr[IndexTrue[V]]);
        }
        for (let F = 0; F < IndexFalse.length; F++) {
            this.HideCol(GetHeadArr[IndexFalse[F]]);
        }
    }
}

export default BiDataTable