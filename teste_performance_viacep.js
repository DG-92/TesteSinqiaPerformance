import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Configuração de métricas personalizadas
const responseTimeTrend = new Trend('response_time');
const successRate = new Rate('success_rate');

export let options = {
    vus: 50, // Número de usuários virtuais
    duration: '30s', // Duração total do teste
    thresholds: {
        'response_time': ['p(95)<500'], // 95% das requisições devem ter tempo de resposta abaixo de 500ms
        'success_rate': ['rate>0.95'], // A taxa de sucesso deve ser maior que 95%
    },
};

export default function () {
    const cep = '01001000'; // CEP para consulta
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    // Executa a requisição HTTP GET
    let res = http.get(url);

    // Verifica se a resposta é válida (status 200 e contém "cep" no corpo)
    let isSuccess = check(res, {
        'status is 200': (r) => r.status === 200,
        'response contains cep': (r) => JSON.parse(r.body).cep === cep,
    });

    // Registra as métricas
    responseTimeTrend.add(res.timings.duration);
    successRate.add(isSuccess);

    sleep(1); // Pausa de 1 segundo entre as requisições
}
