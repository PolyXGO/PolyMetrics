class PolyEnvato{"use strict";static validTimeFrame=[[[6,7],[1,2]],[[1,2],[4,5]]];static authorFee=[55,[[0,37.5],[3750,36.25],[7500,35],[11250,33.75],[15e3,32.5],[18750,31.25],[22500,30],[26250,28.75],[3e4,27.5],[33750,26.25],[37500,25],[41250,23.75],[45e3,22.5],[48750,21.25],[52500,20],[56250,18.75],[6e4,17.5],[63750,16.25],[67500,15],[71250,13.75],[75e3,12.5]]];static initTools=()=>{$(".item-header__details-section").append('<div class="poly-toolsbar"><div>TAX: <input id="poly-tax" type="text" value="20">% <span style="font-size:11px">Percentage rate of corporate income tax or personal income tax</span</div></div>'),$("#poly-tax").on("input",(function(){const t=$(this).val().replace(/[^0-9]/g,"");PolyEnvato.aggregateCalculations(t)}))};static aggregateCalculations=(t=20)=>{$(".poly-elements").remove();const e=PolyEnvato.stripHtmlTags($(".js-condense-item-page-info-panel--last_update time.updated").html()),a=PolyEnvato.stripHtmlTags($('.meta-attributes__table tr:contains("Published") td.meta-attributes__attr-detail').html()),o=PolyEnvato.calculateDaysBetweenDates(a,e),n=PolyEnvato.daysSinceDate(e),s=PolyEnvato.daysSinceDate(e)/30,l=PolyEnvato.daysSinceDate(e)/30/12,r=`<div>It's been <span class="poly-no poly-no-days-since">${PolyEnvato.customFormatNumber(n)} days ~ ${PolyEnvato.customFormatNumber(s)} months ~ ${PolyEnvato.customFormatNumber(l,",",".",2)} years</span> since the last version update.</div>`,i=PolyEnvato.convertToPlainNumber(PolyEnvato.extractNumbers($(".js-purchase-price").html())),d=PolyEnvato.convertToPlainNumber($(".item-header__sales-count strong").html()),c=PolyEnvato.convertToPlainNumber(o),m=PolyEnvato.customFormatNumber(d/(c/30),",",".",2),u=PolyEnvato.customFormatNumber(d/c,",",".",2),p=$(".item-header__details-section"),v=`<div><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-check-fill" viewBox="0 0 16 16">\n            <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2m-5.146-5.146-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L7.5 10.793l2.646-2.647a.5.5 0 0 1 .708.708"/>\n        </svg>&nbsp;${o} days from ${a} to ${e}.</div>${r}`,y=23e3,b=PolyEnvato.authorFee[1],h=i-5,P=i*d,E=5*d,f={value:[],bind:"",totals_author_fee:0,totals_profit:0};PolyEnvato.calculationRevenue(h,d,f);const g=f.totals_profit,F=`${b[b.length-1][1]}% - ${b[0][1]}%`,N=`\n            <table class="poly-table">\n                <thead>\n                    <tr>\n                        <td>Price Level</td>\n                        <td>Author Fee %</td>\n                        <td>Author Fee</td>\n                        <td>Profit</td>\n                        <td>Sales target</td>\n                    </tr>\n                </thead>\n                <tbody>${f.bind}</tbody>\n            </table>`,_=`\n            <div>Without author fee, buyer fee</div>\n            <div class="poly-fee-block">\n                <div>Total buyer fee: $${PolyEnvato.customFormatNumber(E)} ($5/ item ~${PolyEnvato.customFormatNumber(115e3)}VND)</div>\n                <div>Total author fee: $${PolyEnvato.customFormatNumber(f.totals_author_fee,",",".",2)} (${F})</div>\n                ${N}\n            </div>`,w=t,T=w*g/100,x=g-T,D=h-h*b[b.length-1][1]/100,S=h-h*b[0][1]/100,A=`\n            <table class="poly-table">\n                <thead>\n                    <tr>\n                        <td>Sales</td>\n                        <td>Price</td>\n                        <td>Revenue without fee & TAX</td>\n                        <td>Profit before TAX</td>\n                        <td>Avg days</td>\n                        <td>Avg month</td>\n                        <td>TAX ${w}%</td>\n                        <td>Profit after TAX</td>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr>\n                        <td>${PolyEnvato.customFormatNumber(d)}</td>\n                        <td>\n                            <div class="poly-fee-block">\n                                <div>Sale price: <span class="poly-no">$${PolyEnvato.customFormatNumber(i,",",".",2)}</span></div>\n                                <div>Profit price from <span class="poly-no">$${PolyEnvato.customFormatNumber(S,",",".",2)}</span> to <span class="poly-no">$${PolyEnvato.customFormatNumber(D,",",".",2)}</span></div>\n                            </div>\n                        </td>\n                        <td><span class="poly-no">$${PolyEnvato.customFormatNumber(P)}</span></td>\n                        <td>\n                            <span class="poly-no">$${PolyEnvato.customFormatNumber(g)}</span>\n                            <div>${_}</div>\n                        </td>\n                        <td>${u}</td>\n                        <td>${m}</td>\n                        <td class="poly-with-fix"><span class="poly-no">$${PolyEnvato.customFormatNumber(T)}</span> ~${PolyEnvato.customFormatNumber(T*y)}VND</td>\n                        <td class="poly-with-fix"><span class="poly-no poly-no-profit">$${PolyEnvato.customFormatNumber(x)}</span> ~${PolyEnvato.customFormatNumber(x*y)}VND</td>\n                    </tr>\n                </tbody>\n            </table>`;p.after(`<div class="poly-elements">${v}${A}</div>`)};static updateClock=t=>{setInterval((()=>{const e=PolyEnvato.getCountryTime(t),a=PolyEnvato.canSendEmailNow(t);$("#poly-lock").html(e),$("#poly-can-send").html(a?`The current time frame in ${t} is appropriate; you can send the email now.`:`The current time frame in ${t} is not appropriate; you should send the email later.`)}),1e3)};static removeWordsFromString=(t,e)=>{const a=`\\b(${e.join("|")})\\b`,o=new RegExp(a,"gi");return t.replace(o,"").replace(/\s+/g," ").trim()};static capitalizeFirstLetter=t=>t.replace(/\b\w/g,(t=>t.toUpperCase()));static stripHtmlTags=t=>$("<div>").html(t).text().trim();static daysSinceDate=t=>{const e=new Date-new Date(t);return Math.round(e/864e5)};static calculateDaysBetweenDates=(t,e)=>Math.round((new Date(e)-new Date(t))/864e5).toLocaleString();static convertToPlainNumber=(t=0)=>("string"!=typeof t&&(t=String(t)),parseInt(t.replace(/[,\.]/g,""),10));static customFormatNumber=(t,e=",",a=".",o=0)=>{const n=t.toFixed(o).split(".");return n[0]=n[0].replace(/\B(?=(\d{3})+(?!\d))/g,e),n.join(a)};static extractNumbers=t=>parseFloat((t||"").replace(/[^0-9.]/g,""));static calculationRevenue=(t,e,a)=>{let o=t*e,n=o;const s=PolyEnvato.authorFee[1];let l=0,r=0;for(let e=0;e<s.length;e++){const[i,d]=s[e],c=d/100,m=e+1<s.length?s[e+1][0]:o,u=Math.min(n,m-i),p=u/t,v=u*(1-c);l+=v,n-=u;const y=u*c;r+=y;const $=u*e;if(a.value.push({revenue:$,profit:v,author_fee:y,sales_target:p,percent:d}),a.bind+=`\n                <tr>\n                    <td>$${PolyEnvato.customFormatNumber($)}</td>\n                    <td>${d}%</td>\n                    <td>$${PolyEnvato.customFormatNumber(y,",",".",2)}</td>\n                    <td>$${PolyEnvato.customFormatNumber(v,",",".",2)}</td>\n                    <td>${PolyEnvato.customFormatNumber(p,",",".",2)}</td>\n                </tr>`,n<=0)break}return a.totals_author_fee=r,a.totals_profit=l,a}}