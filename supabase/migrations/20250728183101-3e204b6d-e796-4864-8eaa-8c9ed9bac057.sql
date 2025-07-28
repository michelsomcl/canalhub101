-- Add category field to companies table
ALTER TABLE public.companies 
ADD COLUMN categoria text CHECK (categoria IN ('Industria', 'Financas'));

-- Add category field to indicator_definitions table  
ALTER TABLE public.indicator_definitions
ADD COLUMN categoria text CHECK (categoria IN ('Industria', 'Financas'));

-- Insert indicator definitions for Industria category
INSERT INTO public.indicator_definitions (name, field_name, category, unit, sql_column, description, categoria) VALUES
('Receitas de Bens e Serviços', 'receitas_bens_servicos', 'revenue', 'currency', 'receitas_bens_servicos', 'Receitas provenientes da venda de bens e serviços', 'Industria'),
('Custo da Receita Operacional', 'custo_receita_operacional', 'revenue', 'currency', 'custo_receita_operacional', 'Custos diretos relacionados à receita operacional', 'Industria'),
('Despesas Operacionais - Total', 'despesas_operacionais_total', 'revenue', 'currency', 'despesas_operacionais_total', 'Total das despesas operacionais', 'Industria'),
('Lucro Operacional antes da Receita/Despesa Não Recorrente', 'lucro_operacional_antes_receita_despesa_nao_recorrente', 'profitability', 'currency', 'lucro_operacional_antes_receita_despesa_nao_recorrente', 'Lucro operacional antes de itens não recorrentes', 'Industria'),
('Lucro Líquido após Impostos', 'lucro_liquido_apos_impostos', 'profitability', 'currency', 'lucro_liquido_apos_impostos', 'Lucro líquido final após impostos', 'Industria'),
('Caixa e Equivalentes de Caixa', 'caixa_equivalentes_caixa', 'cash_flow', 'currency', 'caixa_equivalentes_caixa', 'Valor disponível em caixa e equivalentes', 'Industria'),
('Fluxo de caixa liquido das atividades operacionais', 'fluxo_caixa_liquido_atividades_operacionais', 'cash_flow', 'currency', 'fluxo_caixa_liquido_atividades_operacionais', 'Fluxo de caixa das operações', 'Industria'),
('Variacao liquida de Caixa Total', 'variacao_liquida_caixa_total', 'cash_flow', 'currency', 'variacao_liquida_caixa_total', 'Variação total do caixa no período', 'Industria'),
('Capital de Giro', 'capital_giro', 'debt', 'currency', 'capital_giro', 'Capital de giro da empresa', 'Industria'),
('Endividamento total', 'endividamento_total', 'debt', 'currency', 'endividamento_total', 'Endividamento total da empresa', 'Industria'),
('Pecentual da divida total do ativo total', 'percentual_divida_total_ativo_total', 'debt', 'percentage', 'percentual_divida_total_ativo_total', 'Percentual da dívida em relação ao ativo total', 'Industria'),
('Liquidez Geral', 'liquidez_geral', 'liquidity', 'ratio', 'liquidez_geral', 'Índice de liquidez geral', 'Industria'),
('Liquidez Corrente', 'liquidez_corrente', 'liquidity', 'ratio', 'liquidez_corrente', 'Índice de liquidez corrente', 'Industria'),
('EBIT', 'ebit', 'profitability', 'currency', 'ebit', 'Lucro antes de juros e impostos', 'Industria'),
('EBITDA', 'ebitda', 'profitability', 'currency', 'ebitda', 'Lucro antes de juros, impostos, depreciação e amortização', 'Industria'),
('Margem EBITDA %', 'margem_ebitda_percent', 'profitability', 'percentage', 'margem_ebitda_percent', 'Margem EBITDA em percentual', 'Industria'),
('Margem de lucro bruto %', 'margem_lucro_bruto_percent', 'profitability', 'percentage', 'margem_lucro_bruto_percent', 'Margem de lucro bruto em percentual', 'Industria'),
('Margem operacional %', 'margem_operacional_percent', 'profitability', 'percentage', 'margem_operacional_percent', 'Margem operacional em percentual', 'Industria'),
('Margem liquida %', 'margem_liquida_percent', 'profitability', 'percentage', 'margem_liquida_percent', 'Margem líquida em percentual', 'Industria'),
('ROIC', 'roic', 'returns', 'percentage', 'roic', 'Retorno sobre o capital investido', 'Industria'),
('ROE', 'roe', 'returns', 'percentage', 'roe', 'Retorno sobre o patrimônio líquido', 'Industria'),
('ROA', 'roa', 'returns', 'percentage', 'roa', 'Retorno sobre os ativos', 'Industria'),
('Dividend Yield', 'dividend_yield', 'returns', 'percentage', 'dividend_yield', 'Rendimento de dividendos', 'Industria');