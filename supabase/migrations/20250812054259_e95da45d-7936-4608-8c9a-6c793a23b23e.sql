-- Insert more occurrences for today and recent days (< 5 dias)
-- All values adhere to occurrences table CHECK constraints

-- Hoje (12 novas)
INSERT INTO public.occurrences (
  vip, override, reincidencia,
  data_ocorrencia, data_resolucao, data_limite_sla, data_previsao_encerramento, data_encerramento,
  tipo_agencia, transportadora, supt, usuario_responsavel, prioridade_fornecedor, observacoes,
  status_equipamento, motivo_ocorrencia, agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento, uf
) VALUES
(false,false,false, now() - interval '15 minute', NULL, NULL, now() + interval '6 hour', NULL,
 'convencional','Protege','21',NULL,NULL,'Seed hoje','inoperante','Falha rede','0101','ATM Saque','ASQ-201','Sem comunicação','em_andamento','alta','alta','NCR','atm','SP'),
(false,false,false, now() - interval '35 minute', NULL, NULL, now() + interval '7 hour', NULL,
 'terceirizada','Brinks','22',NULL,NULL,'Seed hoje','operante','Erro motor','1102','ATM Depósito','ADP-202','Ruído incomum','pendente','media','media','Diebold','atm','RJ'),
(false,false,false, now() - interval '1 hour', NULL, NULL, now() + interval '9 hour', NULL,
 'convencional','Prosegur','23',NULL,NULL,'Seed hoje','inoperante','Cabeçote','2103','Impressora','IMP-203','Sem impressão','em_andamento','media','baixa','Lexmark','rede','MG'),
(false,false,false, now() - interval '90 minute', NULL, NULL, now() + interval '12 hour', NULL,
 'convencional','Protege','24',NULL,NULL,'Seed hoje','operante','Oscilação','3104','Monitor LCD/LED','MON-204','Tela piscando','em_andamento','baixa','baixa','Nextvision','rede','PR'),
(false,false,false, now() - interval '2 hour', NULL, NULL, now() + interval '10 hour', NULL,
 'terceirizada','TBFort','25',NULL,NULL,'Seed hoje','inoperante','Leitura falha','4105','Leitor biométrico','BIO-205','Falha intermitente','com_impedimentos','media','alta','NCR','pos','SP'),
(false,false,false, now() - interval '3 hour', NULL, NULL, now() + interval '14 hour', NULL,
 'convencional','Brinks','26',NULL,NULL,'Seed hoje','operante','Atolamento','5106','Scanner de Cheque','SCN-206','Atola ao digitalizar','pendente','media','media','STM','rede','RJ'),
(false,false,false, now() - interval '4 hour', NULL, NULL, now() + interval '16 hour', NULL,
 'convencional','Prosegur','27',NULL,NULL,'Seed hoje','inoperante','Contagem','6107','TCR','TCR-207','Não recicla cédulas','em_andamento','alta','critica','Diebold','datacenter','SP'),
(false,false,false, now() - interval '20 minute', NULL, NULL, now() + interval '5 hour', NULL,
 'terceirizada','Protege','28',NULL,NULL,'Seed hoje','operante','Conexão','7108','Servidor','SRV-208','Perda de pacotes','pendente','alta','media','STM','datacenter','RS'),
(false,false,false, now() - interval '50 minute', NULL, NULL, now() + interval '11 hour', NULL,
 'convencional','TBFort','29',NULL,NULL,'Seed hoje','inoperante','Fragmentação','8109','Fragmentadora de Papel','FRG-209','Lâmina travada','em_andamento','media','media','Nextvision','rede','MG'),
(false,false,false, now() - interval '2 hour', NULL, NULL, now() + interval '18 hour', NULL,
 'convencional','Brinks','51',NULL,NULL,'Seed hoje','operante','Teclas','9110','Teclado','TCL-210','Teclas não respondem','pendente','baixa','baixa','Artis','rede','PR'),
(false,false,false, now() - interval '25 minute', NULL, NULL, now() + interval '6 hour', NULL,
 'terceirizada','Prosegur','52',NULL,NULL,'Seed hoje','inoperante','Cassete','0111','Cassete','CAS-211','Troca necessária','em_andamento','media','media','STM','atm','SP'),
(false,false,false, now() - interval '10 minute', NULL, NULL, now() + interval '4 hour', NULL,
 'convencional','Protege','53',NULL,NULL,'Seed hoje','inoperante','Saque','1112','ATM Saque','ASQ-212','Erro no dispensador','pendente','alta','alta','NCR','atm','SP');

-- Últimos 4 dias (12 novas, todas < 5 dias)
INSERT INTO public.occurrences (
  vip, override, reincidencia,
  data_ocorrencia, data_resolucao, data_limite_sla, data_previsao_encerramento, data_encerramento,
  tipo_agencia, transportadora, supt, usuario_responsavel, prioridade_fornecedor, observacoes,
  status_equipamento, motivo_ocorrencia, agencia, equipamento, numero_serie, descricao,
  status, prioridade, severidade, fornecedor, segmento, uf
) VALUES
(false,false,false, now() - interval '1 day 2 hour', NULL, NULL, now() + interval '20 hour', NULL,
 'convencional','Brinks','54',NULL,NULL,'Seed <5d','operante','Falha geral','2113','Televisão','TV-213','Sem sinal HDMI','em_andamento','baixa','baixa','Nextvision','rede','MG'),
(false,false,false, now() - interval '1 day 5 hour', NULL, NULL, now() + interval '30 hour', NULL,
 'terceirizada','TBFort','55',NULL,NULL,'Seed <5d','inoperante','Bateria','3114','Notebook','NTB-214','Bateria não carrega','pendente','media','baixa','Artis','datacenter','SP'),
(false,false,false, now() - interval '2 day 3 hour', NULL, NULL, now() + interval '15 hour', NULL,
 'convencional','Prosegur','56',NULL,NULL,'Seed <5d','operante','Trava','4115','Impressora térmica','IMT-215','Etiqueta desalinhada','em_andamento','media','media','Lexmark','rede','RJ'),
(false,false,false, now() - interval '2 day 6 hour', NULL, NULL, now() + interval '28 hour', NULL,
 'convencional','Protege','57',NULL,NULL,'Seed <5d','inoperante','Rede','5116','Servidor','SRV-216','Link instável','pendente','alta','media','STM','datacenter','RS'),
(false,false,false, now() - interval '3 day 1 hour', NULL, NULL, now() + interval '18 hour', NULL,
 'terceirizada','Brinks','58',NULL,NULL,'Seed <5d','operante','Sensor','6117','Leitor biométrico','BIO-217','Sensor aquecendo','em_andamento','alta','alta','NCR','pos','SP'),
(false,false,false, now() - interval '3 day 7 hour', NULL, NULL, now() + interval '22 hour', NULL,
 'convencional','Prosegur','59',NULL,NULL,'Seed <5d','operante','Driver','7118','Scanner de Cheque','SCN-218','Driver corrompido','pendente','media','media','STM','rede','MG'),
(false,false,false, now() - interval '4 day 2 hour', NULL, NULL, now() + interval '12 hour', NULL,
 'convencional','TBFort','21',NULL,NULL,'Seed <5d','inoperante','Temperatura','8119','Servidor','SRV-219','Superaquecimento','em_andamento','alta','critica','STM','datacenter','PR'),
(false,false,false, now() - interval '4 day 6 hour', NULL, NULL, now() + interval '26 hour', NULL,
 'terceirizada','Protege','22',NULL,NULL,'Seed <5d','operante','Display','9120','Monitor LCD/LED','MON-220','Backlight fraco','pendente','baixa','baixa','Nextvision','rede','RJ'),
(false,false,false, now() - interval '4 day 10 hour', NULL, NULL, now() + interval '10 hour', NULL,
 'convencional','Brinks','23',NULL,NULL,'Seed <5d','inoperante','Cassete','0121','Cassete','CAS-221','Erro de encaixe','em_andamento','media','media','STM','atm','SP'),
(false,false,false, now() - interval '2 day 22 hour', NULL, NULL, now() + interval '5 hour', NULL,
 'convencional','Prosegur','24',NULL,NULL,'Seed <5d','operante','Firmware','1122','ATM Depósito','ADP-222','Atualização pendente','pendente','media','alta','Diebold','atm','MG'),
(false,false,false, now() - interval '1 day 20 hour', NULL, NULL, now() + interval '8 hour', NULL,
 'terceirizada','TBFort','25',NULL,NULL,'Seed <5d','inoperante','Saque','2123','ATM Saque','ASQ-223','Atolamento de cédulas','em_andamento','alta','alta','NCR','atm','SP'),
(false,false,false, now() - interval '3 day 14 hour', NULL, NULL, now() + interval '12 hour', NULL,
 'convencional','Protege','26',NULL,NULL,'Seed <5d','operante','Rede','3124','Notebook','NTB-224','Queda de Wi-Fi','pendente','baixa','baixa','Artis','datacenter','RS');