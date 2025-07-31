import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Company } from "@/types/company";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BalanceDataDialogProps {
  onSuccess: () => void;
}

export function BalanceDataDialog({ onSuccess }: BalanceDataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCompanies();
    }
  }, [open]);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      setCompanies((data || []).map(item => ({
        ...item,
        categoria: item.categoria as 'Industria' | 'Financas' | undefined
      })));
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas do banco de dados.",
        variant: "destructive"
      });
    }
  };

  const fetchBalanceData = async () => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
    
    if (!selectedCompany) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada.",
        variant: "destructive"
      });
      return;
    }

    const ticker = selectedCompany.ticker;
    const apiUrl = `https://brapi.dev/api/quote/${ticker}?modules=incomeStatementHistory,balanceSheetHistoryQuarterly,cashflowHistoryQuarterly,financialData,defaultKeyStatistics&token=wPfe7QiGAUvuz5E2ERzQag`;

    setLoading(true);
    try {
      toast({
        title: "Buscando dados...",
        description: `Fazendo requisição para a API externa para ${selectedCompany.nome} (${ticker}).`,
      });

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const apiData = await response.json();
      
      if (!apiData.results || !apiData.results[0]) {
        throw new Error("Dados não encontrados na API");
      }

      const result = apiData.results[0];
      
      // Get the latest quarter data from different sources
      const balanceSheet = result.balanceSheetHistoryQuarterly?.[0];
      const incomeStatement = result.incomeStatementHistory?.incomeStatementHistory?.[0];
      const cashFlow = result.cashflowHistoryQuarterly?.[0];
      const financialData = result.financialData;
      
      if (!balanceSheet && !incomeStatement && !cashFlow) {
        throw new Error("Nenhum dado trimestral encontrado na API");
      }

      // Get quarter info from the most recent data
      const endDate = balanceSheet?.endDate || incomeStatement?.endDate || cashFlow?.endDate;
      let year = new Date().getFullYear();
      let quarter_number = 1;
      let quarter = `${year}-Q1`;

      if (endDate) {
        const date = new Date(endDate);
        year = date.getFullYear();
        const month = date.getMonth() + 1;
        quarter_number = Math.ceil(month / 3);
        quarter = `${year}TRI${quarter_number}`;
      }

      // Map API data to database fields based on the user's mapping
      const quarterData = {
        company_id: selectedCompany.id,
        year,
        quarter_number,
        quarter,
        
        // Revenue data from income statement
        receitas_bens_servicos: incomeStatement?.totalRevenue || null,
        custo_receita_operacional: incomeStatement?.costOfRevenue || null,
        despesas_operacionais_total: incomeStatement?.totalOperatingExpenses || null,
        lucro_operacional_antes_receita_despesa_nao_recorrente: incomeStatement?.operatingIncome || null,
        lucro_liquido_apos_impostos: incomeStatement?.netIncome || null,
        
        // Cash flow data
        caixa_equivalentes_caixa: balanceSheet?.cash || null,
        fluxo_caixa_liquido_atividades_operacionais: cashFlow?.totalCashFromOperatingActivities || null,
        variacao_liquida_caixa_total: cashFlow?.changeInCash || null,
        
        // Working capital and debt
        capital_giro: (balanceSheet?.totalCurrentAssets || 0) - (balanceSheet?.totalCurrentLiabilities || 0) || null,
        endividamento_total: balanceSheet?.totalDebt || null,
        ativo_circulante: balanceSheet?.totalCurrentAssets || null,
        passivo_circulante: balanceSheet?.totalCurrentLiabilities || null,
        ativo_total: balanceSheet?.totalAssets || null,
        passivo_total: balanceSheet?.totalLiab || null,
        
        // Calculate percentages and ratios
        percentual_divida_total_ativo_total: balanceSheet?.totalDebt && balanceSheet?.totalAssets 
          ? (balanceSheet.totalDebt / balanceSheet.totalAssets) * 100 : null,
        liquidez_corrente: balanceSheet?.totalCurrentAssets && balanceSheet?.totalCurrentLiabilities
          ? balanceSheet.totalCurrentAssets / balanceSheet.totalCurrentLiabilities : null,
        liquidez_geral: balanceSheet?.totalAssets && balanceSheet?.totalLiab
          ? balanceSheet.totalAssets / balanceSheet.totalLiab : null,
        
        // Financial ratios from financialData
        roe: financialData?.returnOnEquity ? financialData.returnOnEquity * 100 : null,
        roa: financialData?.returnOnAssets ? financialData.returnOnAssets * 100 : null,
        roic: financialData?.returnOnInvestedCapital ? financialData.returnOnInvestedCapital * 100 : null,
        dividend_yield: financialData?.dividendYield ? financialData.dividendYield * 100 : null,
        
        // EBIT and EBITDA
        ebit: incomeStatement?.ebit || null,
        ebitda: incomeStatement?.ebitda || null,
        
        // Margins
        margem_ebitda_percent: incomeStatement?.ebitda && incomeStatement?.totalRevenue
          ? (incomeStatement.ebitda / incomeStatement.totalRevenue) * 100 : null,
        margem_liquida_percent: incomeStatement?.netIncomeRatio ? incomeStatement.netIncomeRatio * 100 : null,
        margem_operacional_percent: incomeStatement?.operatingIncome && incomeStatement?.totalRevenue
          ? (incomeStatement.operatingIncome / incomeStatement.totalRevenue) * 100 : null,
        margem_lucro_bruto_percent: incomeStatement?.grossProfit && incomeStatement?.totalRevenue
          ? (incomeStatement.grossProfit / incomeStatement.totalRevenue) * 100 : null,
        
        // Earnings per share
        lucro_por_acao: incomeStatement?.eps || financialData?.earningsPerShare || null,
        preco_acao: result.regularMarketPrice || null,
      };

      // Check if data already exists for this company and quarter
      const { data: existingData, error: checkError } = await supabase
        .from('financial_indicators')
        .select('id')
        .eq('company_id', selectedCompany.id)
        .eq('quarter', quarterData.quarter)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingData) {
        toast({
          title: "Dados já existem",
          description: "Os dados para este trimestre já foram importados.",
          variant: "destructive"
        });
        return;
      }

      // Insert new data
      const { error: insertError } = await supabase
        .from('financial_indicators')
        .insert(quarterData);

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: `Dados de balanço importados com sucesso para ${selectedCompany.nome}.`,
      });

      setOpen(false);
      onSuccess();

    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
      toast({
        title: "Erro",
        description: `Erro ao buscar dados da API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          Dados de Balanço
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Buscar Dados de Balanço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="company">Selecione a Empresa</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma empresa..." />
              </SelectTrigger>
              <SelectContent>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.ticker} - {company.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={fetchBalanceData} 
              disabled={!selectedCompanyId || loading}
            >
              {loading ? 'Buscando...' : 'Buscar Dados'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}