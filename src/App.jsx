import { useState, useMemo, useCallback, Fragment } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const CY = 2025;
const PORT_NAMES = ['Alang','Bhavnagar','Jafrabad','Jamnagar','Magdalla','Mandvi','Mangrol','Navlakhi','Okha','Porbandar','Veraval','Dahej','Hazira','Mundra'];
const PG_IDX = {'Magdalla':0,'Dahej':0,'Hazira':0,'Bhavnagar':1,'Alang':1,'Navlakhi':1,'Jamnagar':2,'Okha':2,'Mundra':2,'Mandvi':2,'Veraval':3,'Porbandar':3,'Mangrol':3,'Jafrabad':3};
const PG_NAMES = ['South Gujarat Coast','Saurashtra East','Saurashtra West','South Saurashtra'];

const LPA_META = {
  "GAPL/APSEZL Mundra (3404 Acres)":   {start:2000,term:30,acqCr:7.00,  rec:false},
  "Hazira Port Pvt Ltd (409 Ha)":       {start:2007,term:30,acqCr:0.00,  rec:true, recYr:2007},
  "Petronet LNG Limited":               {start:1999,term:30,acqCr:9.70,  rec:false},
  "APPPL Dahej Plot 1":                 {start:2009,term:30,acqCr:2.71,  rec:false},
  "APPPL Dahej Plot 2":                 {start:2009,term:30,acqCr:2.31,  rec:false},
  "Swan LNG Pvt Ltd":                   {start:2017,term:30,acqCr:7.10,  rec:false},
  "Bhavnagar Port Infra Pvt Ltd":       {start:2024,term:30,acqCr:14.20, rec:false},
  "Nauyaan Shipyard Pvt Ltd":           {start:2025,term:30,acqCr:14.40, rec:false},
  "Modest Infrastructure Pvt Ltd":      {start:2007,term:30,acqCr:0.46,  rec:false},
};
const LPA_RENT = {
  "GAPL/APSEZL Mundra (3404 Acres)":10234000,"Hazira Port Pvt Ltd (409 Ha)":409,
  "Petronet LNG Limited":23436000,"APPPL Dahej Plot 1":23412000,"APPPL Dahej Plot 2":12571000,
  "Swan LNG Pvt Ltd":68030000,"Bhavnagar Port Infra Pvt Ltd":14798800,
  "Nauyaan Shipyard Pvt Ltd":14187745,"Modest Infrastructure Pvt Ltd":343800,
};

const SCEN_KEYS = ['sopc_cur','sopc_rev','opt1','opt2','opt3','opt4','opt5','opt6'];
const SCEN_META = {
  sopc_cur:{label:'SoPC Current',       short:'SoPC Cur', color:'#1e40af',bg:'#dbeafe', rec:false},
  sopc_rev:{label:'SoPC Revised',       short:'SoPC Rev', color:'#1d4ed8',bg:'#bfdbfe', rec:false},
  opt1:    {label:'Opt 1 — Fresh Val',  short:'Opt 1',    color:'#6d28d9',bg:'#ede9fe', rec:false},
  opt2:    {label:'Opt 2 — 40% Factor', short:'Opt 2',    color:'#7c3aed',bg:'#f5f3ff', rec:false},
  opt3:    {label:'Opt 3 — Continue',   short:'Opt 3',    color:'#065f46',bg:'#d1fae5', rec:false},
  opt4:    {label:'Opt 4 — Last+WPI',   short:'Opt 4',    color:'#0f766e',bg:'#ccfbf1', rec:false},
  opt5:    {label:'Opt 5 — 50% Hike',   short:'Opt 5',    color:'#92400e',bg:'#fef3c7', rec:false},
  opt6:    {label:'Opt 6 — Block ✓ REC',short:'Opt 6 ✓',  color:'#14532d',bg:'#bbf7d0', rec:true},
};
const TYPE_META = {
  sopc:               {label:'SoPC Ordinary',      color:'#1e40af',bg:'#dbeafe'},
  lpa:                {label:'LPA Firm Land',       color:'#6d28d9',bg:'#ede9fe'},
  reclaimed_pre2018:  {label:'Reclaimed Pre-2018',  color:'#92400e',bg:'#fef3c7'},
  reclaimed_post2018: {label:'Reclaimed Post-2018', color:'#065f46',bg:'#d1fae5'},
};
const STATUS_META = {
  active:   {label:'Active',   color:'#065f46',bg:'#d1fae5'},
  expiring: {label:'<5 yrs',   color:'#92400e',bg:'#fef3c7'},
  expired:  {label:'Expired',  color:'#991b1b',bg:'#fee2e2'},
};

// ═══════════════════════════════════════════════════════════════════
// RAW PLOT DATA
// ═══════════════════════════════════════════════════════════════════
const RAW = [
[800,0,0,"S&S Brothers"],[800,0,0,"Ushmaniya Oxygen"],[600,0,0,"Capital Oxygen"],[600,0,0,"Superior Air Products"],[800,0,0,"Aims Oxygen"],[600,0,0,"Sharma Co"],[425,0,0,"Indian Red Cross"],[800,0,0,"SBS Bhavnagar"],[875,0,0,"Shirdi Steel Traders"],[875,0,0,"Gupta Steel Bhavnagar"],[240,0,0,"Dr M A Hamidani"],[600,0,0,"Hindustan Gas Indu"],[600,0,0,"Peckok Chemicals"],[800,0,0,"BM Shah Sons"],[300,0,0,"Pravin Vaja"],[304,0,0,"BSNL Alang Tower"],[441,0,0,"Bombay Weighbridge"],[964.5,0,0,"Manoharsinh Chauhan"],[3375,0,0,"Gujarat Gas Ltd"],
[590,1,0,"Chimanlal N Patel"],[416.58,1,0,"Keshavlal H Patel"],[744,1,0,"Nagindas N Patel"],[919.37,1,0,"JJ Patel Gas Agency"],[75000,1,0,"BVP Products Ltd"],[919.46,1,0,"HP Vitthalpara"],[899.4,1,0,"BK Mansatar"],[836.43,1,0,"HK Kamdar Sons"],[100,1,0,"Union Fair Scale"],[3442.5,1,0,"Mars Metal Oxides"],[928,1,0,"Namrata Gas Agency"],[250.61,1,0,"JM Baxi Co"],[791,1,0,"Jirawala Plastic"],[900,1,0,"Bharat Petroleum Bhvngr"],[196,1,0,"Dhandin Weighbridge"],[1400,1,0,"Sea Land Shipping"],[928,1,0,"Dilipsinh A Gohil"],[960,1,0,"Ushaben R Agrawal"],[2500,1,0,"Laxmi Toughened Glass"],[900,1,0,"Daxaben Manadalia"],[800,1,0,"Shrenik Sales 1"],[2500,1,0,"Bhavna Marine Engg"],[1044,1,0,"Nileshkumar H Patel"],[750,1,0,"Jitendra M Vyas"],[215.8,1,0,"Abdul Razaq Lati"],[1800,1,0,"Mayurdhvajsinh Ghohil"],[682.84,1,0,"Kiritkumar H Patel"],[400,1,0,"Saurashtra Petroleums"],[800,1,0,"Param Plastic Inds"],[1000,1,0,"Police Stn Bhavnagar"],[9058,1,0,"JK Steel Alloys"],[1134,1,0,"Sea Services Pvt Ltd"],[900,1,0,"Heena Gases"],[1000,1,0,"Khamaba Gohil"],[222.71,1,0,"Vishalpara G 1"],[155.04,1,0,"Vishalpara G 2"],[547.2,1,0,"Nitinbhai Loriya"],[1800,1,0,"Kirit J Bhatt"],[4,1,0,"Reliance Jio Bhv 1"],[9,1,0,"Reliance Jio Bhv 2"],[2100,1,0,"Pravasini Joshi"],[1800,1,0,"Dhirajkumar Rajai"],[700,1,0,"Shrenik Sales 2"],[1250,1,0,"Patanjali Marine"],[10000,1,0,"Mahek Agro Mineral"],[1250,1,0,"Maya Marine Logistics"],[47432,1,1,"Bhavnagar Port Infra Pvt Ltd"],
[450,2,0,"Matsyodhyog Mandali Jafr"],[137,2,0,"Police Sub-Inspector Jafr"],[471120,2,1,"Swan LNG Pvt Ltd"],
[25,3,0,"Reliance Jio Bedi"],[600,3,0,"Shreeji Shipping NP"],[500,3,0,"Shreeji Shipping Bedi"],[23720,3,0,"Reliance Inds Sikka"],[600,3,0,"NK Parmar Co"],[7170,3,0,"Gujarat State Warehousing"],[25,3,0,"Reliance Jio Rozi"],[25,3,0,"Reliance Jio NP Jmn"],[227120,3,0,"Digvijay Cement Sikka"],[3600,3,0,"Shakti Clearing NP"],[500,3,0,"Vasuki Trade Link"],[55.35,3,0,"Directorate of Lighthouses"],[29071,3,0,"Shakti Clearing Wharf"],[1103.6,3,0,"Veer Dock Company"],[1063.21,3,0,"Custom Agents Assn"],[560,3,0,"Jamnagar Panjrapol 1"],[470,3,0,"Jamnagar Panjrapol 2"],[10156,3,0,"Integrated Proteins"],[750,3,0,"Salaya Machimar Mandli"],[1524,3,0,"Aziz J Charania"],
[22360,4,0,"Narmada Cement Co"],[210,4,0,"Gayatri Weighbridge Mgd"],[1700,4,0,"Ashwani Shipping Corp"],[300,4,0,"Guj Fisheries Umargam"],[300,4,0,"Guj Fisheries Kosamba"],[288501,4,1,"Nauyaan Shipyard Pvt Ltd"],[11460,4,1,"Modest Infrastructure Pvt Ltd"],
[1114,5,0,"Hindustan Petroleum Mndv"],[350,5,0,"Nurmamad H Sangani"],[660,5,0,"Gujarat Fisheries Jakhau"],[1225,5,0,"Zarpara Matsyodhyog"],[165,5,0,"Sara Engineering Works"],[38.2,5,0,"BSNL Jakhau"],[1000,5,0,"Adani Port Weighbridge"],
[1425,6,0,"Kalyan Ice Cold Storage"],
[1700,7,0,"Shivm Marine Services"],[4740,7,0,"Chaugule Co Salt"],[450,7,0,"Gayatri Weighbridge NLK"],[220,7,0,"BSNL Rajkot Tower"],[300,7,0,"Police Outpost Rajkot"],[233,7,0,"Indus Tower NLK"],
[400,8,0,"Pavanputra Fish 1"],[300,8,0,"Pavanputra Fish 2"],[750,8,0,"Adarsh Fish 1"],[750,8,0,"Adarsh Fish 2"],[12270,8,0,"Comm of Fisheries GKU"],[660,8,0,"SBI Okha"],[200,8,0,"Police Station Okha"],[900,8,0,"Coastal Marine Police Okha"],[1032,8,0,"Indian Roadlines Jmn"],
[256,9,0,"Sagar Sarvodaya"],[660,9,0,"Premilaben Lodhari"],[300,9,0,"Associated Transport"],[256,9,0,"JaySagar Fishing"],[434,9,0,"RatnaSagar Ice"],[35.55,9,0,"Nilamben Kotiya"],[2460,9,0,"Agro Marine"],[459.02,9,0,"SagarSakti Fishing"],[315,9,0,"Hiren Enterprises"],[1352.81,9,0,"Mustaq Haji Siddik"],[428.41,9,0,"Deep Ice Industries"],[370,9,0,"Arjan Hira Lodhari"],[464,9,0,"Premji Kanji Lodhari 1"],[468,9,0,"Jivan Padhu Masani"],[346,9,0,"Narsi Kanji Jungi"],[601.18,9,0,"Rajmilan Transport"],[1250,9,0,"Suraj Ice Cold Storage"],[120.4,9,0,"SHV Energy LPG"],[371.58,9,0,"Dhansukh Lodhari 1"],[320,9,0,"Pavanputra Fisheries 1"],[900,9,0,"Jaysagar Fisheries"],[468,9,0,"Ganesh Ice Factory"],[798,9,0,"Narsi Velji Lodhari"],[862.8,9,0,"Kanji Ramji Salet"],[748,9,0,"Bhikhu Velji Lodhari"],[360,9,0,"Kishore R Lodhari"],[519.2,9,0,"Bhimji Padhu"],[584.85,9,0,"Vivek Matsyodhog"],[484,9,0,"Hiralal Babu Masani"],[225,9,0,"Paresh Narsi Jungi"],[240,9,0,"Savitaben Narsi Jungi"],[2161.54,9,0,"Chum Fresh Fish"],[930,9,0,"Jayaben Lodhari 1"],[350,9,0,"Faruq Aftab Exports"],[286,9,0,"Narsi Babubhai Masani"],[135,9,0,"Narsi B Masani"],[400,9,0,"Rajdhani Fisheries"],[2100,9,0,"Gajraj Fish Shed"],[632,9,0,"Jitendra N Lodhari"],[300,9,0,"Vinod Premji Kotiya"],[227,9,0,"Madhavji Motivaras"],[600,9,0,"Ruhi Frozen Foods"],[1560,9,0,"Rajesh Babulal Panjri"],[1400,9,0,"NK Jungi"],[850,9,0,"Premji Kanji Lodhari 2"],[251.2,9,0,"Dinesh Ramji"],[846,9,0,"Babulal J Khokhri"],[1710,9,0,"Alokkumar HN Tripathi"],[798,9,0,"Karsan Ramji Salet"],[480,9,0,"Velji Kanji Kotiya"],[175,9,0,"Pramilaben Lodhari"],[600,9,0,"Velji Madhavji Salet"],[2593.5,9,0,"Saurastra Cement"],[1371.75,9,0,"Sunil Devshi Gohil"],[231.25,9,0,"Hiralal Padhu Jungi"],[1595.62,9,0,"Nagarpalika Fish Market"],[900,9,0,"Nagarpalika Mutton Mkt"],[3000,9,0,"Alokkumar Frozen Store"],[500,9,0,"Marine Police PBR"],[5761.5,9,0,"Indian Navy Porbandar"],[1389.53,9,0,"Jadavbhai Chudasama"],[1240.31,9,0,"Chhagan Gokal Lodhari"],[2988.29,9,0,"Amrut Cold Storage"],[80,9,0,"Siddik Yunush Sati"],[1500.29,9,0,"Mohan Hiralal Siyal"],[725,9,0,"Police Asmavati Ghat"],[2228.11,9,0,"Ramesh P Motivaras"],[1084.97,9,0,"Mohanlal P Motivaras"],[979.37,9,0,"Jayaben Lodhari 2"],[600,9,0,"Pravinbhai Masani 1"],[620.5,9,0,"Babubhai KhoKhri"],[240,9,0,"Babubhai KhoKhari"],[2198.18,9,0,"Harish Ramji"],[330,9,0,"Harjivan Kotiya"],[864.58,9,0,"Mohamedsiddiq"],[504,9,0,"Hirabhai Khetalpal"],[1138.76,9,0,"West Coast Foods"],[600,9,0,"Harsh Sagar Mandli"],[535.6,9,0,"Kantaben Kotiya"],[383.84,9,0,"Dhansukh Badarsahi"],[600,9,0,"Shivangi Fisheries"],[1260,9,0,"Nitesh Arjunbhai"],[890,9,0,"Bhartiben R Gohel"],[350,9,0,"Pravinbhai Masani 2"],[25,9,0,"RJIL Old Port 1"],[25,9,0,"RJIL Old Port 2"],[25,9,0,"RJIL Old Port 3"],[4360,9,0,"Honest Dry Fish"],[305.89,9,0,"Kamleshbhai Gohel"],[733.54,9,0,"Nathalal Jungi"],[504,9,0,"Yunushbhai Afini"],[300,9,0,"Ajaybhai Motivaras"],[1842.4,9,0,"Manishbhai Motivaras"],[913.54,9,0,"Nidhi Sea Food"],[2685,9,0,"Taranhar Fresh Fish"],[234,9,0,"Riddhi Siddhi Sea"],[5933.02,9,0,"Silver Star Export"],[690,9,0,"Supdt Police Harbor"],[1110.93,9,0,"Jitendra Mepa Bharada"],[300,9,0,"Kishor Project Ltd"],[511,9,0,"Kush Trading"],[492.73,9,0,"Mitesh Posatariya"],[960,9,0,"Monika Sea Foods"],[518.92,9,0,"Naran Babubhai"],[586.72,9,0,"Khushbu Fresh Fish"],[80,9,0,"Vanitaben Badarshahi 1"],[870.76,9,0,"Mahendra Madhvi"],[300,9,0,"Bipin Fish"],[275.52,9,0,"Kiran Chudasama"],[150,9,0,"Vanitaben Badarshahi 2"],[2049.36,9,0,"Ekta Fisheries"],[960,9,0,"Rajesh Babulal"],[54.05,9,0,"Jayesh J Shiyal"],[4192,9,0,"Silver Fish Sterilizer"],[1150,9,0,"Prakashbhai Shiyal"],[400,9,0,"Milan Matsyaudyog"],
[705,10,0,"Vikas Agency"],[1350,10,0,"Vijay M Rughani"],[675,10,0,"Ibrahim Turaq"],[1350,10,0,"Vinodchandra V"],[675,10,0,"Somnath Band Saw"],[578.88,10,0,"Divya Ice Cold"],[562.5,10,0,"Shitlakrupa Ice"],[562.5,10,0,"Anjali Ice Cold"],[675,10,0,"S Pradipkumar"],[675,10,0,"Shivam Ice Factory"],[631.5,10,0,"Kamet Ice Industries"],[633.75,10,0,"Veravali Krupa Ice"],[705,10,0,"Kailash Ice Factory"],[675.59,10,0,"Vishnulaxmi Ice"],[637.5,10,0,"JK Ice Factory"],[675,10,0,"Becharlal Thanki"],[709.5,10,0,"Minaxi Ice Cold"],[641.25,10,0,"Himalaya Ice Cold"],[470,10,0,"Sunil Ice Factory"],[1350,10,0,"Babubhai N Vadhavi"],[300.04,10,0,"Veraval Petroleums 1"],[705,10,0,"Parsottam Kanabar"],[675,10,0,"Arvindkumar"],[649.5,10,0,"Subham Ice"],[705,10,0,"Shubham Product"],[657.37,10,0,"Cham Trading"],[705,10,0,"Lavji Parmanand"],[707.94,10,0,"Radheshyam Ice"],[225,10,0,"Narayan Workshop"],[1800,10,0,"Dinesh Fofandi"],[586.05,10,0,"Rahul Marine"],[899.08,10,0,"Mugal Kaluhusen"],[637.5,10,0,"Mahamad Faruk"],[525,10,0,"Kalpana Marine"],[525,10,0,"GB Corporation"],[900,10,0,"Mohan Damji Bhesla"],[546.38,10,0,"JaiAmbe Ice"],[439.13,10,0,"Harikrupa Ice"],[406.88,10,0,"Jiaijalaram Ice"],[374.63,10,0,"Mehul Diesel"],[362.08,10,0,"Jalaram Workshop"],[385.13,10,0,"Rajmoti Ice"],[352.87,10,0,"Kaushal Engineering"],[320.63,10,0,"Nathalal Koria"],[290,10,0,"Gujarat Marble"],[181.13,10,0,"Rameshwari Engg"],[133.66,10,0,"Sagardeep Spares"],[61.8,10,0,"Priyank Engineering"],[35.84,10,0,"MP Vaghela"],[449.5,10,0,"Om Ice Factory"],[563.07,10,0,"Narayan Ice VRL"],[500,10,0,"Trivedi Weighbridge"],[600,10,0,"Gangasagar Ice 23-1"],[600,10,0,"Ashaganga Ice 23-2"],[550,10,0,"Keval Exports 24"],[588.5,10,0,"Kanaiya Ice"],[900,10,0,"Keval Exports 26"],[900,10,0,"Rajdhani Ice VRL"],[500,10,0,"Indian Sea Foods"],[600,10,0,"Avdhesh Ice"],[300,10,0,"Haripanth Ice"],[1200,10,0,"Manish Sea Foods"],[548.5,10,0,"Ashwin Ice"],[581,10,0,"Ridhhi Sidhdhi Ice"],[600,10,0,"Krishna Ice 34"],[500,10,0,"Jentibhai Koriya"],[375,10,0,"Parag Ice"],[450,10,0,"Shrinathji Ice"],[450,10,0,"Radhe Ice Cold"],[464.25,10,0,"Jai Mahakal Ice"],[448,10,0,"Chamunda Ice Prod"],[420,10,0,"Chamunda Ice Cold"],[420,10,0,"Maruti Ice Factory"],[350,10,0,"Diwaliben Tank"],[706.38,10,0,"Bhagvati Ice"],[555,10,0,"Shivshakti Ice"],[247.5,10,0,"JitendraKumar Suyani"],[421.13,10,0,"Parishram Spares"],[416.6,10,0,"Ramabhai Barad"],[446.25,10,0,"Ratnaker Ice"],[448.2,10,0,"Balaji Workshop"],[374.63,10,0,"Kishan Bhesla"],[601.11,10,0,"Vanita Cold 52-53"],[831.7,10,0,"Vanita Cold 54-55"],[831.7,10,0,"Krishna Ice 58"],[831.7,10,0,"Khodiyar Ice"],[90,10,0,"Kiran Electrical"],[667.32,10,0,"Vanita Cold 56-57"],[846.99,10,0,"Shivshakti Marine"],[396.99,10,0,"Makwana Re-power"],[1500,10,0,"Monark Sea Foods"],[1770,10,0,"Hindustan Petr VRL"],[988,10,0,"Deepmala Marine 5"],[990,10,0,"Deepmala Marine 6"],[1976,10,0,"Saraswati Ice C"],[532,10,0,"Gangasagar Ice C"],[1300,10,0,"Veraval Industries"],[376,10,0,"Trikamlal Gohel"],[324,10,0,"Naran Karshan"],[1774.18,10,0,"Veraval Samsat"],[928.88,10,0,"Iswarprakash Ice FH1"],[449.84,10,0,"GFCCA FH Partial"],[3020,10,0,"Castle Rock FH2"],[3020,10,0,"Castle Rock FH3"],[3236.55,10,0,"Castle Rock Cold"],[2531.61,10,0,"Cent Inst Fisheries"],[3442.01,10,0,"Kalpataru Fofandi"],[2950,10,0,"BMG Fisheries FH"],[2229.67,10,0,"Bhavani Sea FH-9"],[2229.76,10,0,"Maruti Krupa Ice"],[3922,10,0,"Alana Frozen FH-17"],[595,10,0,"Shakti Ice FH-22"],[1005,10,0,"Parishram Ice FH"],[310,10,0,"GFCCA Fueling"],[55.74,10,0,"Babubhai R Jungi"],[55.74,10,0,"Madhu Khapandi"],[760,10,0,"Chandra Machinery"],[660,10,0,"Urmi Marine"],[2960,10,0,"Fisheries Dept Stn"],[3810.94,10,0,"Bhavani Sea FH-38"],[2010,10,0,"Gopal Fisheries FH44"],[743.22,10,0,"Gopal Fisheries FH47"],[873.47,10,0,"Bhavani Sea FH-48"],[2607.56,10,0,"Hariom Ice Cold"],[288,10,0,"Saraswati Ice FH57"],[1660,10,0,"Deepmala Marine FH58"],[180,10,0,"Virmlaben Suyani"],[67.38,10,0,"Mansukhlal Suyani"],[67.1,10,0,"Jamnadas Dodia"],[70,10,0,"Somnath Marine"],[80,10,0,"Pithadia Freezing"],[74.32,10,0,"Harilal Pithadia"],[214.5,10,0,"Pithadiya Frizing"],[1160.83,10,0,"Dinesh Sea FH-16"],[99.98,10,0,"Rameshchandra Fofandi"],[2859.15,10,0,"Iswarprakash Ice FH36"],[1002.93,10,0,"Anurag Sea Foods"],[1670.78,10,0,"Elite Ship Yard"],[1989.53,10,0,"Veraval Shipping"],[625,10,0,"Jai Sagar Co-op"],[1168.21,10,0,"RJ Trivedi Sons"],[4935.94,10,0,"VRL Machchhi Kharid"],[208.82,10,0,"Vallabh Haridas"],[400,10,0,"GFCCA Navabander"],[450,10,0,"Jafrabad Machhi Sangh"],[743.59,10,0,"Faruq Pirani"],[49.92,10,0,"Trikamlal Agya"],[1114,10,0,"GFCCA Ice Misc"],[800,10,0,"Parishram Co-op"],[604.08,10,0,"Jalaram Ice Misc"],[94.84,10,0,"Kharva Assn"],[9840,10,0,"GFCCA Boat Building"],[185.92,10,0,"Sorathiya Traders"],[540.96,10,0,"Babu Jamal Patni"],[557.69,10,0,"Iqubal Haji"],[625,10,0,"Mahesh Saw Mills"],[321.5,10,0,"Bharat Computer WB"],[4141,10,0,"Coast Guard Godown"],[1993.39,10,0,"Bharat Petroleum"],[23886.68,10,0,"Sorath Onion Assn"],[1000,10,0,"Marine Police NB"],[2000,10,0,"Mansukh Suyani Misc"],[200,10,0,"Chamunda Ice Misc"],[841.66,10,0,"Honest Ice Cold"],[300.04,10,0,"Veraval Petroleum H"],[720,10,0,"Chandrakant Co"],[375,10,0,"Ganesh Sagar Petro"],
[485910,11,1,"Petronet LNG Limited"],[135708,11,1,"APPPL Dahej Plot 1"],[115367,11,1,"APPPL Dahej Plot 2"],
[4090000,12,1,"Hazira Port Pvt Ltd (409 Ha)"],
[13774000,13,1,"GAPL/APSEZL Mundra (3404 Acres)"]
];

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════
function margF(area, bounds, pcts) {
  const br = [0, ...bounds, Infinity];
  let w = 0, a = 0;
  for (let i = 0; i < 4; i++) {
    const c = Math.max(0, Math.min(area, br[i+1]) - br[i]);
    if (!c) break;
    w += c * pcts[i]; a += c;
  }
  return a ? w / a : pcts[0];
}
function slabI(area, b) { return area <= b[0] ? 0 : area <= b[1] ? 1 : area <= b[2] ? 2 : 3; }
function calcIRR(cfs) {
  if (!cfs || cfs.length < 2) return null;
  let r = 0.08;
  for (let i = 0; i < 200; i++) {
    let n = 0, d = 0;
    for (let t = 0; t < cfs.length; t++) {
      const pv = Math.pow(1 + r, t);
      n += cfs[t] / pv;
      d -= t * cfs[t] / Math.pow(1 + r, t + 1);
    }
    if (Math.abs(d) < 1e-12) break;
    const r1 = r - n / d;
    if (Math.abs(r1 - r) < 1e-8) { r = r1; break; }
    r = Math.max(-0.99, Math.min(9, r1));
  }
  return isNaN(r) || !isFinite(r) ? null : r;
}
function getAnnGrowth(c) {
  if (c.escType === 'wpi') return c.wpiRate / 100;
  if (c.escType === '10pct3yr') return Math.pow(1.1, 1/3) - 1;
  if (c.escType === '20pct3yr') return Math.pow(1.2, 1/3) - 1;
  return Math.pow(1 + c.escPct / 100, 1 / Math.max(1, c.escPeriod)) - 1;
}
function buildCFs(inv, yr1, g, horizon, residual, expiry, curRent) {
  if (inv <= 0) return null;
  const cfs = [-inv];
  const yToExp = Math.max(0, expiry - CY);
  let cR = curRent;
  for (let y = 1; y <= horizon; y++) {
    if (y <= yToExp) { cfs.push(cR); cR *= (1 + g); }
    else { cfs.push(yr1 * Math.pow(1 + g, y - yToExp - 1)); }
  }
  cfs[cfs.length - 1] += residual;
  return cfs;
}
function fmtCr(v) {
  const c = v / 1e7;
  if (c >= 100) return '₹' + Math.round(c) + ' Cr';
  if (c >= 1)   return '₹' + c.toFixed(2) + ' Cr';
  return '₹' + (v / 1e5).toFixed(1) + ' L';
}
function fmtPct(v) { return v === null ? '—' : (v * 100).toFixed(1) + '%'; }
function fmtChg(v, base) {
  if (!base || base === 0) return '—';
  const p = ((v - base) / Math.abs(base)) * 100;
  return (p >= 0 ? '+' : '') + p.toFixed(0) + '%';
}
function fmtMx(v, base) {
  if (!base || base === 0) return '—';
  return (v / base).toFixed(2) + '×';
}
function fmtA(a) {
  return a >= 10000 ? (a / 10000).toFixed(2) + ' Ha' : a.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' sqm';
}

// ═══════════════════════════════════════════════════════════════════
// BUILD INITIAL PLOTS
// ═══════════════════════════════════════════════════════════════════
let _id = 0;
function buildPlots() {
  return RAW.map(function(row) {
    const area = row[0], portIdx = row[1], isLPA = row[2] === 1, name = row[3];
    const port  = PORT_NAMES[portIdx];
    const pgIdx = PG_IDX[port] !== undefined ? PG_IDX[port] : 0;
    const meta  = isLPA ? LPA_META[name] : null;
    const rec   = meta && meta.rec ? true : false;
    const landType = isLPA ? (rec ? 'reclaimed_pre2018' : 'lpa') : 'sopc';
    const currentRent = isLPA ? (LPA_RENT[name] || 0) : (area / 10) * 1018;
    return {
      id: _id++, name, port, portIdx, pgIdx, landType, area,
      currentRent,
      leaseStart:  meta ? meta.start : 2015,
      leaseTerm:   meta ? meta.term  : (isLPA ? 30 : 5),
      acqCr:       meta ? meta.acqCr : 0,
      indivVal:    null, acqValPsqm: null,
      recYear:     meta && meta.recYr ? meta.recYr : null,
      notes: '',
    };
  });
}
const INIT_PLOTS = buildPlots();

const DEF_CTRL = {
  sopcCurRate:1018, sopcRevRate:1200,
  pgVals:[6000,4000,4000,3000],
  pgAcqPsqm:[400,300,250,200],
  slabBounds:[1000,10000,100000],
  slabPcts:[100,90,70,50],
  slabUF:[90,85,70,35],
  freshPctMode:'6',   // '1.5' | '6' | 'custom'
  freshPctCustom:10,
  escType:'20pct3yr', escPct:20, escPeriod:3, wpiRate:6,
  blockPct:50, blockYrs:15, numBlocks:3,
  reclPct:20, rebateYrs:10, rebateDiscount:50,
  holdoverOn:false, penaltyMult:3,
  irrHorizon:30, residualPct:100,
};

// ═══════════════════════════════════════════════════════════════════
// STYLE HELPERS
// ═══════════════════════════════════════════════════════════════════
const INP = {border:'1px solid #d1d5db',borderRadius:4,padding:'3px 7px',fontSize:11,background:'#fff',color:'#111',width:80};
const SEL = {border:'1px solid #d1d5db',borderRadius:4,padding:'3px 6px',fontSize:11,background:'#fff',color:'#111'};
const TH  = {fontSize:10,fontWeight:600,color:'#6b7280',padding:'5px 7px',textAlign:'left',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',whiteSpace:'nowrap'};
const TD  = {fontSize:11,padding:'5px 7px',borderBottom:'1px solid #f3f4f6',verticalAlign:'middle'};
function btnS(active, col) {
  return {fontSize:11,padding:'5px 13px',borderRadius:5,cursor:'pointer',border:'none',
    background:active?(col||'#1e40af'):'#f3f4f6',color:active?'#fff':'#374151',fontWeight:active?700:400};
}
function badge(color, bg) {
  return {fontSize:9,padding:'2px 7px',borderRadius:10,background:bg,color,fontWeight:700,display:'inline-block'};
}
function getFreshPct(c) {
  if (c.freshPctMode === '1.5') return 1.5;
  if (c.freshPctMode === '6')   return 6;
  return c.freshPctCustom || 10;
}

// ═══════════════════════════════════════════════════════════════════
// CONTROL PANEL SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function CPSec({ label, open, onToggle, children }) {
  return (
    <div style={{borderBottom:'1px solid #f0f0f0'}}>
      <button onClick={onToggle} style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',padding:'7px 10px',background:open?'#eff6ff':'transparent',border:'none',cursor:'pointer',fontSize:11,fontWeight:700,color:'#1e40af',textAlign:'left'}}>
        <span>{label}</span>
        <span style={{fontSize:9,color:'#9ca3af'}}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{padding:'8px 10px 12px'}}>{children}</div>}
    </div>
  );
}
function CPRow({ label, children }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
      <span style={{fontSize:10,color:'#6b7280',flex:1,paddingRight:4}}>{label}</span>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}
function Slider({ val, min, max, step, color, onChange, suffix }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:4}}>
      <input type="range" min={min} max={max} step={step||1} value={val}
        onChange={function(e){onChange(+e.target.value);}}
        style={{width:80,accentColor:color||'#1e40af'}}/>
      <span style={{fontSize:10,fontWeight:700,minWidth:38,textAlign:'right',color:color||'#374151'}}>{val}{suffix||''}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════
function ControlPanel({ c, setC }) {
  const [open, setOpen] = useState({rates:true,pvals:false,slab:true,fresh:true,esc:true,opt6:true,recl:false,hold:false,irr:false});
  function tog(k) { setOpen(function(o) { return Object.assign({},o,{[k]:!o[k]}); }); }
  function upd(k) { return function(v) { setC(function(p) { return Object.assign({},p,{[k]:v}); }); }; }
  function updArr(k, i) {
    return function(v) {
      setC(function(p) { const a = p[k].slice(); a[i] = +v; return Object.assign({},p,{[k]:a}); });
    };
  }
  const annG = (getAnnGrowth(c) * 100).toFixed(2);
  const fp = getFreshPct(c);

  return (
    <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden',fontSize:11}}>
      <div style={{background:'#1e3a8a',padding:'8px 10px'}}>
        <p style={{color:'#fff',fontSize:12,fontWeight:700,margin:0}}>⚙️ Control Panel</p>
        <p style={{color:'#93c5fd',fontSize:9,margin:'2px 0 0'}}>All levers — changes update live</p>
      </div>

      {/* A — SoPC */}
      <CPSec label="A — SoPC Rates" open={open.rates} onToggle={function(){tog('rates');}}>
        <CPRow label="Current (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcCurRate} onChange={function(e){upd('sopcCurRate')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="Revised (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcRevRate} onChange={function(e){upd('sopcRevRate')(+e.target.value);}}/>
        </CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:3}}>
          Cur: ₹{(c.sopcCurRate/10).toFixed(1)}/sqm &nbsp;|&nbsp; Rev: ₹{(c.sopcRevRate/10).toFixed(1)}/sqm
        </div>
      </CPSec>

      {/* B — Port Valuations */}
      <CPSec label="B — Port Valuations (₹/sqm)" open={open.pvals} onToggle={function(){tog('pvals');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Group Jantri value — fallback when no individual value entered on plot</p>
        <div style={{fontSize:9,fontWeight:700,color:'#374151',marginBottom:4}}>Current Jantri (Opt 1 &amp; 2):</div>
        {PG_NAMES.map(function(g,i){
          return (
            <CPRow key={g} label={g.replace(' Coast','').replace('Saurashtra ','Srt ')}>
              <input type="number" style={INP} value={c.pgVals[i]} onChange={function(e){updArr('pgVals',i)(+e.target.value);}}/>
            </CPRow>
          );
        })}
        <div style={{fontSize:9,fontWeight:700,color:'#374151',margin:'8px 0 4px'}}>Historical Acq. Cost ₹/sqm (IRR-Actual):</div>
        {PG_NAMES.map(function(g,i){
          return (
            <CPRow key={g+'a'} label={g.replace(' Coast','').replace('Saurashtra ','Srt ')}>
              <input type="number" style={INP} value={c.pgAcqPsqm[i]} onChange={function(e){updArr('pgAcqPsqm',i)(+e.target.value);}}/>
            </CPRow>
          );
        })}
      </CPSec>

      {/* C — Slab Configuration — COMPACT FIXED LAYOUT */}
      <CPSec label="C — Slab Configuration" open={open.slab} onToggle={function(){tog('slab');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Opt 1 &amp; 2 · all land types</p>

        {/* Boundaries — compact 2-col grid */}
        <div style={{background:'#f1f5f9',borderRadius:5,padding:'6px 7px',marginBottom:7}}>
          <p style={{fontSize:9,fontWeight:700,color:'#374151',margin:'0 0 5px'}}>Boundaries (sqm)</p>
          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',rowGap:3,columnGap:6,alignItems:'center'}}>
            {[['I→II',0],['II→III',1],['III→IV',2]].map(function(pair){
              return (
                <Fragment key={pair[0]}>
                  <span style={{fontSize:9,color:'#6b7280',fontFamily:'monospace',whiteSpace:'nowrap'}}>{pair[0]}</span>
                  <input type="number"
                    style={{fontSize:10,padding:'2px 5px',border:'1px solid #d1d5db',borderRadius:3,width:'100%',boxSizing:'border-box',textAlign:'right',color:'#111',background:'#fff'}}
                    value={c.slabBounds[pair[1]]}
                    onChange={function(e){updArr('slabBounds',pair[1])(+e.target.value);}}/>
                </Fragment>
              );
            })}
          </div>
        </div>

        {/* Per-slab cards — 2-col grid for sliders */}
        <p style={{fontSize:9,fontWeight:700,color:'#374151',margin:'0 0 4px'}}>Rent % &amp; Utilisation per Slab</p>
        {['I','II','III','IV'].map(function(l,i){
          const colors = ['#1e40af','#065f46','#92400e','#991b1b'];
          const bgs    = ['#dbeafe','#d1fae5','#fef3c7','#fee2e2'];
          const lo = i===0?'0':(c.slabBounds[i-1]>=1000?(c.slabBounds[i-1]/1000).toFixed(0)+'k':c.slabBounds[i-1]);
          const hi = i===3?'∞':(c.slabBounds[i]>=1000?(c.slabBounds[i]/1000).toFixed(0)+'k':c.slabBounds[i]);
          return (
            <div key={l} style={{marginBottom:4,padding:'5px 7px',background:'#f8fafc',borderRadius:5,border:'1px solid #e5e7eb'}}>
              {/* Badge + range header */}
              <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:4}}>
                <span style={badge(colors[i],bgs[i])}>S{l}</span>
                <span style={{fontSize:9,color:'#6b7280',fontFamily:'monospace'}}>{lo} – {hi} sqm</span>
              </div>
              {/* Vertically stacked sliders — always fits panel width */}
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {[
                  {label:'Rent %', val:c.slabPcts[i], min:0,  max:150, step:5,  color:colors[i], onChange:function(v){updArr('slabPcts',i)(v);}},
                  {label:'Util %', val:c.slabUF[i],   min:10, max:100, step:5,  color:'#6b7280', onChange:function(v){updArr('slabUF',i)(v);}},
                ].map(function(row){
                  return (
                    <div key={row.label} style={{display:'flex',alignItems:'center',gap:4}}>
                      <span style={{fontSize:9,color:'#9ca3af',fontWeight:600,width:36,flexShrink:0}}>{row.label}</span>
                      <input type="range" min={row.min} max={row.max} step={row.step} value={row.val}
                        onChange={function(e){row.onChange(+e.target.value);}}
                        style={{flex:1,minWidth:0,accentColor:row.color}}/>
                      <span style={{fontSize:10,fontWeight:700,color:row.color,width:34,textAlign:'right',flexShrink:0}}>{row.val}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CPSec>

      {/* D — Fresh Valuation % — DYNAMIC with user input */}
      <CPSec label="D — Fresh Valuation % (Opt 1 &amp; 2)" open={open.fresh} onToggle={function(){tog('fresh');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:8}}>Select a preset or enter your own. Drives both Opt 1 and Opt 2.</p>
        <div style={{display:'flex',gap:5,marginBottom:8}}>
          <button onClick={function(){upd('freshPctMode')('1.5');}} style={Object.assign({},btnS(c.freshPctMode==='1.5','#6d28d9'),{flex:1,fontSize:11})}>1.5%</button>
          <button onClick={function(){upd('freshPctMode')('6');}}   style={Object.assign({},btnS(c.freshPctMode==='6','#6d28d9'),  {flex:1,fontSize:11})}>6%</button>
          <button onClick={function(){upd('freshPctMode')('custom');}} style={Object.assign({},btnS(c.freshPctMode==='custom','#6d28d9'),{flex:1,fontSize:11})}>Custom</button>
        </div>
        {c.freshPctMode === 'custom' && (
          <div style={{display:'flex',alignItems:'center',gap:6,background:'#f5f3ff',borderRadius:6,padding:'6px 8px',marginBottom:6}}>
            <span style={{fontSize:10,color:'#6d28d9',fontWeight:600}}>Enter %:</span>
            <input type="number" min={0} max={100} step={0.1}
              style={Object.assign({},INP,{width:70,borderColor:'#7c3aed'})}
              value={c.freshPctCustom}
              onChange={function(e){upd('freshPctCustom')(+e.target.value);}}/>
            <span style={{fontSize:10,color:'#6d28d9'}}>of valuation</span>
          </div>
        )}
        <div style={{background:'#ede9fe',borderRadius:5,padding:'6px 8px',fontSize:9,color:'#5b21b6'}}>
          <strong>Active: {fp}%</strong><br/>
          Opt 1 = Val × {fp}% × slab × util<br/>
          Opt 2 = Val × 40% × {fp}% × slab × util
        </div>
      </CPSec>

      {/* E — Escalation */}
      <CPSec label="E — Escalation (Opt 3–6)" open={open.esc} onToggle={function(){tog('esc');}}>
        <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
          {[['10pct3yr','10%/3yr'],['20pct3yr','20%/3yr'],['wpi','WPI%'],['custom','Custom']].map(function(pair){
            return <button key={pair[0]} onClick={function(){upd('escType')(pair[0]);}} style={Object.assign({},btnS(c.escType===pair[0],'#065f46'),{fontSize:10,padding:'4px 8px'})}>{pair[1]}</button>;
          })}
        </div>
        {c.escType === 'wpi' && (
          <CPRow label="WPI Rate (%)"><input type="number" style={INP} value={c.wpiRate} step={0.5} onChange={function(e){upd('wpiRate')(+e.target.value);}}/></CPRow>
        )}
        {c.escType === 'custom' && (
          <Fragment>
            <CPRow label="Escalation (%)"><input type="number" style={INP} value={c.escPct} onChange={function(e){upd('escPct')(+e.target.value);}}/></CPRow>
            <CPRow label="Every N years"><input type="number" style={INP} value={c.escPeriod} min={1} max={10} onChange={function(e){upd('escPeriod')(+e.target.value);}}/></CPRow>
          </Fragment>
        )}
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Annual equivalent: <strong>{annG}% p.a.</strong></div>
      </CPSec>

      {/* F — Option 6 */}
      <CPSec label="F — Option 6 Block Settings" open={open.opt6} onToggle={function(){tog('opt6');}}>
        <CPRow label="Block step-up %"><Slider val={c.blockPct} min={10} max={150} step={5} color="#14532d" suffix="%" onChange={upd('blockPct')}/></CPRow>
        <CPRow label="Block duration (yrs)"><input type="number" style={INP} value={c.blockYrs} min={5} max={30} onChange={function(e){upd('blockYrs')(+e.target.value);}}/></CPRow>
        <CPRow label="Number of blocks"><input type="number" style={INP} value={c.numBlocks} min={1} max={5} onChange={function(e){upd('numBlocks')(+e.target.value);}}/></CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Post-term: {c.blockYrs*c.numBlocks} yrs &nbsp;·&nbsp; Total tenure: {30+c.blockYrs*c.numBlocks} yrs</div>
      </CPSec>

      {/* G — Reclaimed */}
      <CPSec label="G — Reclaimed Land" open={open.recl} onToggle={function(){tog('recl');}}>
        <CPRow label="% of firm land rent"><Slider val={c.reclPct} min={0} max={100} step={5} color="#92400e" suffix="%" onChange={upd('reclPct')}/></CPRow>
        <CPRow label="Rebate period (yrs)"><Slider val={c.rebateYrs} min={0} max={20} step={1} color="#888" suffix="" onChange={upd('rebateYrs')}/></CPRow>
        <CPRow label="Rebate sub-discount"><Slider val={c.rebateDiscount} min={0} max={100} step={10} color="#888" suffix="%" onChange={upd('rebateDiscount')}/></CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          Pre-2018 base ₹1/Ha · Post-2018 base ₹1,000/Ha<br/>
          After rebate: {c.reclPct}% of firm · During rebate: {(c.reclPct*c.rebateDiscount/100).toFixed(1)}% of firm
        </div>
      </CPSec>

      {/* H — Holdover */}
      <CPSec label="H — Holdover / Penalty" open={open.hold} onToggle={function(){tog('hold');}}>
        <label style={{fontSize:11,display:'flex',alignItems:'center',gap:6,cursor:'pointer',marginBottom:6,color:'#374151'}}>
          <input type="checkbox" checked={c.holdoverOn} onChange={function(e){upd('holdoverOn')(e.target.checked);}}/> Apply penalty to expired leases
        </label>
        {c.holdoverOn && (
          <Fragment>
            <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Expired leases show penalised rent in Existing column (as per LMR)</p>
            <CPRow label="Penalty multiplier"><Slider val={c.penaltyMult} min={1} max={6} step={0.5} color="#991b1b" suffix="×" onChange={upd('penaltyMult')}/></CPRow>
          </Fragment>
        )}
      </CPSec>

      {/* I — IRR */}
      <CPSec label="I — IRR Settings" open={open.irr} onToggle={function(){tog('irr');}}>
        <CPRow label="Horizon (years)"><input type="number" style={INP} value={c.irrHorizon} min={5} max={75} onChange={function(e){upd('irrHorizon')(+e.target.value);}}/></CPRow>
        <CPRow label="Residual val at horizon"><Slider val={c.residualPct} min={0} max={300} step={10} color="#1e40af" suffix="%" onChange={upd('residualPct')}/></CPRow>
        <div style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          IRR(Actual) = return on GMB's real spend<br/>
          IRR(Revalued) = return on today's Jantri value
        </div>
      </CPSec>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PLOT EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════
function PlotEditor({ plot, onSave, onDelete, onClose, isNew }) {
  const [f, setF] = useState(Object.assign({}, plot));
  function s(k) { return function(e) { setF(function(p) { return Object.assign({},p,{[k]:e.target.value}); }); }; }
  function n(k) { return function(e) { setF(function(p) { return Object.assign({},p,{[k]:e.target.value===''?null:+e.target.value}); }); }; }
  function portChg(e) {
    const port=e.target.value, portIdx=PORT_NAMES.indexOf(port), pgIdx=PG_IDX[port]!==undefined?PG_IDX[port]:0;
    setF(function(p){return Object.assign({},p,{port,portIdx,pgIdx});});
  }
  const fields = [
    ['Lessee / Plot Name','text','name',s,'name',220],
    ['Lease Start Year','number','leaseStart',n,'leaseStart',80],
    ['Lease Term (yrs)','number','leaseTerm',n,'leaseTerm',80],
    ['Area (sqm)','number','area',n,'area',90],
    ['Current Rent (₹/yr)','number','currentRent',n,'currentRent',120],
    ['Acquisition Cost (₹ Cr)','number','acqCr',n,'acqCr',90],
    ['Indiv. Jantri (₹/sqm)','number','indivVal',n,'indivVal',90],
    ['Hist. Acq ₹/sqm','number','acqValPsqm',n,'acqValPsqm',90],
    ['Notes','text','notes',s,'notes',200],
  ];
  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,padding:'1.25rem',width:420,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontWeight:700,fontSize:13,color:'#111'}}>{isNew?'+ Add Plot':'Edit Plot'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
        </div>
        <div style={{marginBottom:6,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:'#6b7280',minWidth:130}}>Port</span>
          <select style={SEL} value={f.port} onChange={portChg}>{PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}</select>
        </div>
        <div style={{marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontSize:11,color:'#6b7280',minWidth:130}}>Land Type</span>
          <select style={SEL} value={f.landType} onChange={s('landType')}>
            <option value="sopc">SoPC (Ordinary)</option>
            <option value="lpa">LPA (Firm / Greenfield)</option>
            <option value="reclaimed_pre2018">Reclaimed Pre-2018</option>
            <option value="reclaimed_post2018">Reclaimed Post-2018</option>
          </select>
        </div>
        {fields.map(function(fld){
          const [label,type,key,handler,,w]=fld;
          return (
            <div key={key} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:'#6b7280',minWidth:130,flexShrink:0}}>{label}</span>
              <input type={type} style={Object.assign({},INP,{width:w||80})} value={f[key]===null||f[key]===undefined?'':f[key]} onChange={handler(key)} placeholder={type==='number'&&f[key]===null?'group default':''}/>
            </div>
          );
        })}
        {(f.landType==='reclaimed_pre2018'||f.landType==='reclaimed_post2018')&&(
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:'#6b7280',minWidth:130}}>Reclamation Year</span>
            <input type="number" style={INP} value={f.recYear||''} onChange={n('recYear')}/>
          </div>
        )}
        <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:14,paddingTop:10,borderTop:'1px solid #e5e7eb'}}>
          {!isNew&&<button onClick={function(){if(window.confirm('Delete this plot?'))onDelete(plot.id);}} style={Object.assign({},btnS(false),{color:'#dc2626'})}>Delete</button>}
          <button onClick={onClose} style={btnS(false)}>Cancel</button>
          <button onClick={function(){onSave(Object.assign({},f,{id:plot.id}));}} style={btnS(true,'#1e40af')}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROW DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
function RowDetail({ row, onClose, onEdit }) {
  const p=row.p, ex=row.existing, rents=row.rents, irrs=row.irrs;
  const tm=TYPE_META[p.landType]||TYPE_META.sopc;
  const sm=STATUS_META[p.status]||STATUS_META.active;
  return (
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}>
      <div style={{background:'#fff',width:520,height:'100%',overflowY:'auto',padding:'1.25rem',boxShadow:'-10px 0 40px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div>
            <p style={{fontWeight:700,fontSize:13,margin:0,color:'#111'}}>{p.name}</p>
            <p style={{fontSize:11,color:'#6b7280',margin:'3px 0 0'}}>{p.port} · {fmtA(p.area)} · <span style={badge(tm.color,tm.bg)}>{tm.label}</span> <span style={badge(sm.color,sm.bg)}>{sm.label}</span></p>
          </div>
          <div style={{display:'flex',gap:5}}>
            <button onClick={onEdit} style={btnS(true,'#6d28d9')}>Edit</button>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:12}}>
          {[['Lease Start',p.leaseStart],['Expiry',p.expiry],['Years Left',p.yearsLeft>0?p.yearsLeft:'Expired'],
            ['Acq. Cost',p.acqCr?'₹'+p.acqCr+' Cr':'—'],['Jantri Val',row.pv?'₹'+row.pv.toLocaleString('en-IN')+'/sqm':'—'],['Existing Rent',fmtCr(ex)]
          ].map(function(item){
            return <div key={item[0]} style={{background:'#f9fafb',borderRadius:6,padding:'6px 8px'}}><p style={{fontSize:9,color:'#9ca3af',margin:0}}>{item[0]}</p><p style={{fontSize:11,fontWeight:600,margin:'2px 0 0',color:'#111'}}>{item[1]}</p></div>;
          })}
        </div>
        <p style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:4}}>Full Impact — All 8 Scenarios</p>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:8}}>IRR(Actual) = return on GMB's real acquisition spend &nbsp;|&nbsp; IRR(Revalued) = return on today's Jantri value</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead><tr>{['Scenario','Proposed ₹','Change ₹','% Chg','Times','IRR(Actual)','IRR(Reval)'].map(function(h){return <th key={h} style={Object.assign({},TH,{textAlign:h==='Scenario'?'left':'right'})}>{h}</th>;})}</tr></thead>
            <tbody>
              {SCEN_KEYS.map(function(k){
                const sm2=SCEN_META[k],r=rents[k],ir=irrs[k],diff=r-ex,isPos=diff>=0;
                return (
                  <tr key={k} style={{background:k==='opt6'?'#f0fdf4':'#fff'}}>
                    <td style={TD}><span style={badge(sm2.color,sm2.bg)}>{sm2.short}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:600})}>{fmtCr(r)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:isPos?'#065f46':'#991b1b',fontWeight:600})}>{diff>=0?'+':''}{fmtCr(Math.abs(diff))}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontWeight:700,color:isPos?'#065f46':'#991b1b'})}>{fmtChg(r,ex)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right'})}>{fmtMx(r,ex)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.actual>0.08?'#065f46':'#92400e'})}>{fmtPct(ir?ir.actual:null)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.rev>0.04?'#065f46':'#6b7280'})}>{fmtPct(ir?ir.rev:null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {p.notes&&<p style={{fontSize:10,color:'#6b7280',marginTop:8}}>Note: {p.notes}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 1 — REVENUE OVERVIEW (big hero UI)
// ═══════════════════════════════════════════════════════════════════
function RevenueOverview({ computed, bifurc, ctrl }) {
  const existingTotal = bifurc.total ? bifurc.total.existing : 0;

  // Sort scenarios by revenue descending for the bar
  const sorted = SCEN_KEYS.slice().sort(function(a,b){
    return (bifurc.total?bifurc.total[b]:0)-(bifurc.total?bifurc.total[a]:0);
  });
  const maxVal = sorted.length > 0 && bifurc.total ? bifurc.total[sorted[0]] : 1;

  // Top impact plots (opt6)
  const topGain = computed.slice().sort(function(a,b){return (b.rents.opt6-b.existing)-(a.rents.opt6-a.existing);}).slice(0,5);
  const topLoss = computed.slice().sort(function(a,b){return (a.rents.opt6-a.existing)-(b.rents.opt6-b.existing);}).slice(0,5);

  return (
    <div>
      {/* Hero — Existing Revenue */}
      <div style={{background:'linear-gradient(135deg,#1e3a8a,#1e40af)',borderRadius:10,padding:'1.25rem 1.5rem',marginBottom:12,color:'#fff'}}>
        <p style={{fontSize:11,color:'#93c5fd',margin:'0 0 4px',fontWeight:600,letterSpacing:'0.05em'}}>CURRENT ANNUAL REVENUE — ALL 407 PLOTS</p>
        <p style={{fontSize:32,fontWeight:800,margin:'0 0 6px',letterSpacing:'-0.02em'}}>{fmtCr(existingTotal)}</p>
        <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
          {['sopc','lpa','reclaimed_pre2018','reclaimed_post2018'].map(function(t){
            const d=bifurc[t]; if(!d)return null;
            const tm=TYPE_META[t];
            return (
              <div key={t} style={{borderLeft:'2px solid rgba(255,255,255,0.3)',paddingLeft:10}}>
                <p style={{fontSize:9,color:'#93c5fd',margin:0}}>{tm.label}</p>
                <p style={{fontSize:14,fontWeight:700,margin:'2px 0 0'}}>{fmtCr(d.existing)}</p>
                <p style={{fontSize:9,color:'#bfdbfe',margin:0}}>{d.count} plots</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenario cards — 4 per row */}
      <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 8px'}}>Year 1 Annual Revenue — All 8 Policy Scenarios</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,marginBottom:14}}>
        {SCEN_KEYS.map(function(k){
          const sm=SCEN_META[k];
          const v=bifurc.total?bifurc.total[k]:0;
          const diff=v-existingTotal;
          const isPos=diff>=0;
          const isRec=sm.rec;
          return (
            <div key={k} style={{background:'#fff',border:isRec?'2px solid #14532d':'1px solid #e5e7eb',borderRadius:8,padding:'0.75rem',boxShadow:isRec?'0 4px 12px rgba(20,83,45,0.15)':'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                <span style={badge(sm.color,sm.bg)}>{sm.short}</span>
                {isRec&&<span style={{fontSize:8,background:'#14532d',color:'#fff',padding:'1px 5px',borderRadius:8,fontWeight:700}}>REC</span>}
              </div>
              <p style={{fontSize:9,color:'#6b7280',margin:'0 0 4px',lineHeight:1.3}}>{sm.label}</p>
              <p style={{fontSize:20,fontWeight:800,margin:'0 0 4px',color:sm.color}}>{fmtCr(v)}</p>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{fontSize:10,fontWeight:700,color:isPos?'#065f46':'#991b1b'}}>{fmtChg(v,existingTotal)}</span>
                <span style={{fontSize:9,color:'#9ca3af'}}>vs existing</span>
              </div>
              {/* Mini bar */}
              <div style={{height:4,background:'#f3f4f6',borderRadius:2,marginTop:6}}>
                <div style={{height:'100%',background:sm.color,borderRadius:2,width:Math.max(4,(v/Math.max(maxVal,1))*100)+'%',transition:'width 0.3s'}}/>
              </div>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <span style={{fontSize:9,color:isPos?'#065f46':'#991b1b',fontWeight:600}}>Δ {diff>=0?'+':''}{fmtCr(Math.abs(diff))}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue comparison bar chart (horizontal) */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'1rem',marginBottom:12}}>
        <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 10px'}}>Relative Revenue — Sorted by Amount</p>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {/* Existing reference */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:10,color:'#1e40af',minWidth:68,fontWeight:700}}>Existing</span>
            <div style={{flex:1,height:18,background:'#dbeafe',borderRadius:3,position:'relative'}}>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:(existingTotal/maxVal*100)+'%',background:'#1e40af',borderRadius:3,minWidth:2}}/>
              <span style={{position:'absolute',right:4,top:1,fontSize:9,color:'#fff',fontWeight:700,lineHeight:'16px'}}>{fmtCr(existingTotal)}</span>
            </div>
          </div>
          {sorted.map(function(k){
            const sm=SCEN_META[k]; const v=bifurc.total?bifurc.total[k]:0;
            const w=Math.max(0.5,(v/maxVal)*100);
            return (
              <div key={k} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:10,minWidth:68,color:sm.color,fontWeight:600}}>{sm.short}</span>
                <div style={{flex:1,height:18,background:sm.bg,borderRadius:3,position:'relative'}}>
                  <div style={{position:'absolute',left:0,top:0,height:'100%',width:w+'%',background:sm.color,borderRadius:3,minWidth:2}}/>
                  <span style={{position:'absolute',right:4,top:1,fontSize:9,color:'#fff',fontWeight:700,lineHeight:'16px'}}>{fmtCr(v)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Land type bifurcation */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'1rem',marginBottom:12}}>
        <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:'0 0 8px'}}>Revenue Bifurcation — Land Type × Scenario (₹ Crore)</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr>
                <th style={Object.assign({},TH,{minWidth:110})}>Land Type</th>
                <th style={Object.assign({},TH,{minWidth:40,textAlign:'right'})}>Plots</th>
                <th style={Object.assign({},TH,{minWidth:70,textAlign:'right',background:'#dbeafe',color:'#1e40af'})}>Existing</th>
                {SCEN_KEYS.map(function(k){return <th key={k} style={Object.assign({},TH,{minWidth:60,textAlign:'right',background:SCEN_META[k].bg,color:SCEN_META[k].color})}>{SCEN_META[k].short}</th>;})}
              </tr>
            </thead>
            <tbody>
              {['sopc','lpa','reclaimed_pre2018','reclaimed_post2018','total'].map(function(t,ti){
                const d=bifurc[t]; if(!d)return null;
                const isTotal=t==='total';
                const tm=TYPE_META[t];
                return (
                  <tr key={t} style={{background:isTotal?'#f0f9ff':ti%2===0?'#fafafa':'#fff',fontWeight:isTotal?700:400}}>
                    <td style={Object.assign({},TD,{fontWeight:isTotal?700:500})}>
                      {tm?<span style={badge(tm.color,tm.bg)}>{tm.label}</span>:<strong>TOTAL</strong>}
                    </td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af'})}>{d.count}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',background:'#eff6ff',fontWeight:isTotal?700:600})}>{fmtCr(d.existing)}</td>
                    {SCEN_KEYS.map(function(k){
                      const diff=d[k]-d.existing;const isPos=diff>=0;
                      return (
                        <td key={k} style={Object.assign({},TD,{textAlign:'right',background:SCEN_META[k].bg+'33'})}>
                          <div style={{fontFamily:'monospace',fontWeight:isTotal?700:500}}>{fmtCr(d[k])}</div>
                          {!isTotal&&<div style={{fontSize:8,color:isPos?'#065f46':'#991b1b',fontWeight:700}}>{fmtChg(d[k],d.existing)}</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top impact plots */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'0.875rem'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#065f46',margin:'0 0 8px'}}>↑ Top 5 — Highest Revenue Gain (vs Existing, under Opt 6)</p>
          {topGain.map(function(row,i){
            const diff=row.rents.opt6-row.existing;
            return (
              <div key={row.p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:i<4?'1px solid #f3f4f6':'none'}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10,fontWeight:600,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#111'}}>{row.p.name}</p>
                  <p style={{fontSize:9,color:'#6b7280',margin:0}}>{row.p.port} · {fmtA(row.p.area)}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:8}}>
                  <p style={{fontSize:11,fontWeight:700,color:'#065f46',margin:0}}>+{fmtCr(diff)}</p>
                  <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{fmtChg(row.rents.opt6,row.existing)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'0.875rem'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#991b1b',margin:'0 0 8px'}}>↓ Top 5 — Highest Revenue Reduction (vs Existing, under Opt 6)</p>
          {topLoss.map(function(row,i){
            const diff=row.rents.opt6-row.existing;
            return (
              <div key={row.p.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 0',borderBottom:i<4?'1px solid #f3f4f6':'none'}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:10,fontWeight:600,margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#111'}}>{row.p.name}</p>
                  <p style={{fontSize:9,color:'#6b7280',margin:0}}>{row.p.port} · {fmtA(row.p.area)}</p>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:8}}>
                  <p style={{fontSize:11,fontWeight:700,color:'#991b1b',margin:0}}>{fmtCr(diff)}</p>
                  <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{fmtChg(row.rents.opt6,row.existing)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2 — DETAILED MATRIX
// ═══════════════════════════════════════════════════════════════════
function DetailedMatrix({ computed, onRowClick }) {
  const [search,setSearch]=useState('');
  const [filt,setFilt]=useState({land:'All',port:'All',status:'All',impact:'All'});
  const [sortK,setSortK]=useState('impact');
  const [pg,setPg]=useState(0);
  const PGS=25;

  const filtered=useMemo(function(){
    let arr=computed;
    if(filt.land!=='All')arr=arr.filter(function(r){return r.p.landType===filt.land;});
    if(filt.port!=='All')arr=arr.filter(function(r){return r.p.port===filt.port;});
    if(filt.status!=='All')arr=arr.filter(function(r){return r.p.status===filt.status;});
    if(filt.impact==='Higher')arr=arr.filter(function(r){return r.rents.opt6>r.existing+1;});
    if(filt.impact==='Lower') arr=arr.filter(function(r){return r.rents.opt6<r.existing-1;});
    if(search){const q=search.toLowerCase();arr=arr.filter(function(r){return r.p.name.toLowerCase().includes(q)||r.p.port.toLowerCase().includes(q);});}
    if(sortK==='impact')   arr=arr.slice().sort(function(a,b){return Math.abs(b.rents.opt6-b.existing)-Math.abs(a.rents.opt6-a.existing);});
    else if(sortK==='area')     arr=arr.slice().sort(function(a,b){return b.p.area-a.p.area;});
    else if(sortK==='existing') arr=arr.slice().sort(function(a,b){return b.existing-a.existing;});
    else if(sortK==='expiry')   arr=arr.slice().sort(function(a,b){return a.p.yearsLeft-b.p.yearsLeft;});
    return arr;
  },[computed,filt,search,sortK]);

  const paged=filtered.slice(pg*PGS,(pg+1)*PGS);
  const totalPg=Math.ceil(filtered.length/PGS);

  function setF(k){return function(v){setFilt(function(f){return Object.assign({},f,{[k]:v});});setPg(0);};}

  return (
    <div>
      {/* Filter bar */}
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap',alignItems:'center',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'7px 10px'}}>
        <input type="text" placeholder="🔍 Search lessee or port…" value={search} onChange={function(e){setSearch(e.target.value);setPg(0);}} style={Object.assign({},INP,{width:165})}/>
        <select style={SEL} value={filt.land} onChange={function(e){setF('land')(e.target.value);}}>
          <option value="All">All types</option><option value="sopc">SoPC</option><option value="lpa">LPA</option>
          <option value="reclaimed_pre2018">Rec&lt;2018</option><option value="reclaimed_post2018">Rec≥2018</option>
        </select>
        <select style={SEL} value={filt.port} onChange={function(e){setF('port')(e.target.value);}}>
          <option value="All">All ports</option>{PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}
        </select>
        <select style={SEL} value={filt.status} onChange={function(e){setF('status')(e.target.value);}}>
          <option value="All">All status</option><option value="active">Active</option><option value="expiring">Expiring</option><option value="expired">Expired</option>
        </select>
        <select style={SEL} value={filt.impact} onChange={function(e){setF('impact')(e.target.value);}}>
          <option value="All">All impacts</option><option value="Higher">↑ Higher</option><option value="Lower">↓ Lower</option>
        </select>
        <select style={SEL} value={sortK} onChange={function(e){setSortK(e.target.value);}}>
          <option value="impact">Sort: Impact</option><option value="area">Sort: Area</option>
          <option value="existing">Sort: Existing ₹</option><option value="expiry">Sort: Expiry</option>
        </select>
        <span style={{fontSize:10,color:'#9ca3af',marginLeft:'auto'}}>{filtered.length} plots · Click row for full detail</span>
      </div>

      {/* Matrix table */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr style={{background:'#f1f5f9'}}>
                <th style={Object.assign({},TH,{minWidth:28,position:'sticky',left:0,zIndex:2})}>#</th>
                <th style={Object.assign({},TH,{minWidth:140,position:'sticky',left:28,zIndex:2})}>Lessee / Plot</th>
                <th style={Object.assign({},TH,{minWidth:58,position:'sticky',left:168,zIndex:2})}>Port</th>
                <th style={Object.assign({},TH,{minWidth:56})}>Type</th>
                <th style={Object.assign({},TH,{minWidth:68,textAlign:'right'})}>Area</th>
                <th style={Object.assign({},TH,{minWidth:48,textAlign:'right'})}>Expiry</th>
                <th style={Object.assign({},TH,{minWidth:50})}>Status</th>
                <th style={Object.assign({},TH,{minWidth:72,textAlign:'right',background:'#dbeafe',color:'#1e40af',borderLeft:'2px solid #93c5fd'})}>Existing ₹</th>
                {SCEN_KEYS.map(function(k){
                  return <th key={k} colSpan={2} style={Object.assign({},TH,{minWidth:115,textAlign:'center',background:SCEN_META[k].bg,color:SCEN_META[k].color,borderLeft:'1px solid #e5e7eb'})}>{SCEN_META[k].short}</th>;
                })}
              </tr>
              <tr style={{background:'#f8fafc'}}>
                <th style={Object.assign({},TH,{position:'sticky',left:0,zIndex:2})}/>
                <th style={Object.assign({},TH,{position:'sticky',left:28,zIndex:2})}/>
                <th style={Object.assign({},TH,{position:'sticky',left:168,zIndex:2})}/>
                <th style={TH}/><th style={TH}/><th style={TH}/><th style={TH}/>
                <th style={Object.assign({},TH,{background:'#eff6ff',borderLeft:'2px solid #93c5fd'})}/>
                {SCEN_KEYS.map(function(k){
                  return (
                    <Fragment key={k}>
                      <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',borderLeft:'1px solid #e5e7eb',fontSize:9,minWidth:58})}>Rent</th>
                      <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',fontSize:9,minWidth:50})}>% Chg</th>
                    </Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paged.map(function(row, ri){
                const p=row.p, ex=row.existing, rents=row.rents;
                const tm=TYPE_META[p.landType]||TYPE_META.sopc;
                const sm=STATUS_META[p.status]||STATUS_META.active;
                const bg=ri%2===0?'#fff':'#fafafa';
                return (
                  <tr key={p.id} style={{background:bg,cursor:'pointer'}}
                    onClick={function(){onRowClick(row);}}
                    onMouseEnter={function(e){e.currentTarget.style.background='#f0f9ff';}}
                    onMouseLeave={function(e){e.currentTarget.style.background=bg;}}>
                    <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af',position:'sticky',left:0,background:bg})}>{pg*PGS+ri+1}</td>
                    <td style={Object.assign({},TD,{maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',position:'sticky',left:28,background:bg,fontWeight:p.landType!=='sopc'?700:400})} title={p.name}>
                      <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                      {p.acqCr>0&&<div style={{fontSize:8,color:'#9ca3af'}}>Acq ₹{p.acqCr}Cr</div>}
                    </td>
                    <td style={Object.assign({},TD,{color:'#6b7280',position:'sticky',left:168,background:bg,fontSize:10})}>{p.port}</td>
                    <td style={TD}><span style={badge(tm.color,tm.bg)}>{tm.label.split(' ')[0]}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtA(p.area)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{p.expiry}</td>
                    <td style={TD}><span style={badge(sm.color,sm.bg)}>{sm.label}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:700,background:'#eff6ff',borderLeft:'2px solid #93c5fd',color:'#1e40af'})}>{fmtCr(ex)}</td>
                    {SCEN_KEYS.map(function(k){
                      const r=rents[k], diff=r-ex, isPos=diff>=0;
                      return (
                        <Fragment key={k}>
                          <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',borderLeft:'1px solid #f0f0f0',background:SCEN_META[k].bg+'22'})}>{fmtCr(r)}</td>
                          <td style={Object.assign({},TD,{textAlign:'right',fontWeight:700,background:SCEN_META[k].bg+'22',color:isPos?'#065f46':'#991b1b'})}>{fmtChg(r,ex)}</td>
                        </Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,padding:'0 2px'}}>
        <span style={{fontSize:10,color:'#6b7280'}}>Page {pg+1} of {totalPg} · {filtered.length} plots</span>
        <div style={{display:'flex',gap:3}}>
          <button disabled={pg===0} onClick={function(){setPg(function(x){return x-1;});}} style={Object.assign({},btnS(false),{opacity:pg===0?0.3:1,fontSize:11})}>← Prev</button>
          {Array.from({length:Math.min(totalPg,7)},function(_,i){return i+Math.max(0,pg-3);}).filter(function(i){return i<totalPg;}).map(function(i){
            return <button key={i} onClick={function(){setPg(i);}} style={btnS(i===pg,'#1e40af')}>{i+1}</button>;
          })}
          <button disabled={pg>=totalPg-1} onClick={function(){setPg(function(x){return x+1;});}} style={Object.assign({},btnS(false),{opacity:pg>=totalPg-1?0.3:1,fontSize:11})}>Next →</button>
        </div>
        <span style={{fontSize:10,color:'#9ca3af'}}>Click row → full IRR detail</span>
      </div>

      <div style={{background:'#f0f9ff',border:'1px solid #bfdbfe',borderRadius:6,padding:'7px 12px',marginTop:8,fontSize:10,color:'#1e40af',lineHeight:1.7}}>
        <strong>Reading guide:</strong> Blue = current Existing rent. Each scenario shows proposed rent + % change. <span style={{color:'#065f46',fontWeight:700}}>Green %</span> = GMB earns more. <span style={{color:'#991b1b',fontWeight:700}}>Red %</span> = lessee gets relief or GMB earns less. Click any row for full detail: ₹ absolute, times multiplier, IRR(Actual), IRR(Revalued). Opt 6 ✓ = GMB recommended option.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════
// PASSWORD GATE
// ═══════════════════════════════════════════════════════════════════
const CORRECT_PWD = 'gmb2026';

function PasswordGate({ onUnlock }) {
  const [pwd, setPwd]   = useState('');
  const [err, setErr]   = useState(false);
  const [show, setShow] = useState(false);

  function attempt() {
    if (pwd === CORRECT_PWD) { onUnlock(); }
    else { setErr(true); setPwd(''); setTimeout(function(){ setErr(false); }, 2000); }
  }
  function onKey(e) { if (e.key === 'Enter') attempt(); }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:'#fff',borderRadius:14,padding:'2.5rem 2rem',width:340,boxShadow:'0 25px 60px rgba(0,0,0,0.4)',textAlign:'center'}}>
        {/* Logo area */}
        <div style={{width:60,height:60,background:'#1e3a8a',borderRadius:14,margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontSize:28}}>⚓</span>
        </div>
        <p style={{fontSize:16,fontWeight:800,color:'#111',margin:'0 0 4px'}}>GMB Land Policy Dashboard</p>
        <p style={{fontSize:11,color:'#6b7280',margin:'0 0 24px'}}>Gujarat Maritime Board — Restricted Access</p>

        {/* Input */}
        <div style={{position:'relative',marginBottom:12}}>
          <input
            type={show ? 'text' : 'password'}
            placeholder="Enter access password"
            value={pwd}
            onChange={function(e){ setPwd(e.target.value); setErr(false); }}
            onKeyDown={onKey}
            style={{width:'100%',boxSizing:'border-box',padding:'10px 40px 10px 14px',fontSize:13,border:err?'2px solid #dc2626':'2px solid #e5e7eb',borderRadius:7,outline:'none',color:'#111',background:err?'#fff5f5':'#fff',transition:'border 0.2s'}}
            autoFocus/>
          <button onClick={function(){setShow(function(s){return !s;});}}
            style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:14,color:'#9ca3af',padding:0}}>
            {show ? '🙈' : '👁'}
          </button>
        </div>

        {err && (
          <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:6,padding:'6px 10px',marginBottom:10,fontSize:11,color:'#991b1b',fontWeight:600}}>
            ✗ Incorrect password. Please try again.
          </div>
        )}

        <button onClick={attempt}
          style={{width:'100%',padding:'10px',background:'#1e3a8a',color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:700,cursor:'pointer',letterSpacing:'0.02em'}}>
          Access Dashboard →
        </button>

        <p style={{fontSize:9,color:'#d1d5db',marginTop:16,lineHeight:1.5}}>
          Authorised GMB personnel only · Government of Gujarat<br/>
          Ports &amp; Transport Department
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [ctrl,  setCtrl]  = useState(DEF_CTRL);
  const [plots, setPlots] = useState(INIT_PLOTS);
  const [editP, setEditP] = useState(null);
  const [detail,setDetail]= useState(null);
  const [isNew, setIsNew] = useState(false);
  const [cpOpen,setCpOpen]= useState(true);
  const [mainTab,setMainTab] = useState(0); // 0=Revenue Overview, 1=Detailed Matrix

  // ── COMPUTE ENGINE ──────────────────────────────────────────────
  const computed = useMemo(function(){
    const g = getAnnGrowth(ctrl);
    const fp = getFreshPct(ctrl);
    return plots.map(function(p){
      const pv      = p.indivVal || ctrl.pgVals[p.pgIdx] || 3000;
      const acqPsqm = p.acqValPsqm || ctrl.pgAcqPsqm[p.pgIdx] || 300;
      const invA    = p.acqCr > 0 ? p.acqCr*1e7 : p.area*acqPsqm;
      const invR    = p.area * pv;
      const slFact  = margF(p.area, ctrl.slabBounds, ctrl.slabPcts)/100;
      const uf      = ctrl.slabUF[slabI(p.area, ctrl.slabBounds)]/100;
      const expiry  = (p.leaseStart||CY)+(p.leaseTerm||30);
      const yearsLeft=expiry-CY;
      const status  = yearsLeft>5?'active':yearsLeft>0?'expiring':'expired';
      const isRec   = p.landType==='reclaimed_pre2018'||p.landType==='reclaimed_post2018';
      const reclF   = isRec ? ctrl.reclPct/100 : 1;
      const rebate  = isRec && p.recYear && (CY-p.recYear)<ctrl.rebateYrs;
      const effReclF= rebate ? reclF*(ctrl.rebateDiscount/100) : reclF;
      const baseEx  = p.currentRent;
      const existing= (ctrl.holdoverOn&&status==='expired') ? baseEx*ctrl.penaltyMult : baseEx;

      function firm(k){
        if(k==='sopc_cur') return (p.area/10)*ctrl.sopcCurRate;
        if(k==='sopc_rev') return (p.area/10)*ctrl.sopcRevRate;
        if(k==='opt1')     return p.area*pv*(fp/100)*slFact*uf;
        if(k==='opt2')     return p.area*pv*0.40*(fp/100)*slFact*uf;
        if(k==='opt3')     return baseEx;
        if(k==='opt4')     return baseEx*(1+ctrl.wpiRate/100);
        if(k==='opt5')     return baseEx*1.5;
        if(k==='opt6')     return baseEx*(1+ctrl.blockPct/100);
        return baseEx;
      }
      const rents={};
      SCEN_KEYS.forEach(function(k){rents[k]=firm(k)*effReclF;});

      const resA=invA*(ctrl.residualPct/100), resR=invR*(ctrl.residualPct/100);
      const irrs={};
      SCEN_KEYS.forEach(function(k){
        const yr1=rents[k];
        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,baseEx);
        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,baseEx);
        irrs[k]={actual:cfsA?calcIRR(cfsA):null, rev:cfsR?calcIRR(cfsR):null};
      });
      return {p:Object.assign({},p,{status,expiry,yearsLeft}), pv, acqPsqm, existing, rents, irrs, isRec, effReclF};
    });
  },[plots,ctrl]);

  // ── BIFURCATION ──────────────────────────────────────────────────
  const bifurc = useMemo(function(){
    const types=['sopc','lpa','reclaimed_pre2018','reclaimed_post2018'];
    const result={};
    types.forEach(function(t){
      const rows=computed.filter(function(r){return r.p.landType===t;});
      const entry={existing:rows.reduce(function(s,r){return s+r.existing;},0),count:rows.length};
      SCEN_KEYS.forEach(function(k){entry[k]=rows.reduce(function(s,r){return s+r.rents[k];},0);});
      result[t]=entry;
    });
    const entry={existing:computed.reduce(function(s,r){return s+r.existing;},0),count:computed.length};
    SCEN_KEYS.forEach(function(k){entry[k]=computed.reduce(function(s,r){return s+r.rents[k];},0);});
    result.total=entry;
    return result;
  },[computed]);

  // ── CRUD ─────────────────────────────────────────────────────────
  const savePlot=useCallback(function(p){
    if(isNew) setPlots(function(ps){return ps.concat([Object.assign({},p,{id:_id++})]);});
    else      setPlots(function(ps){return ps.map(function(x){return x.id===p.id?p:x;});});
    setEditP(null); setIsNew(false);
  },[isNew]);
  const delPlot=useCallback(function(id){setPlots(function(ps){return ps.filter(function(x){return x.id!==id;});});setEditP(null);setIsNew(false);},[]);

  function openAdd(){
    setIsNew(true);
    setEditP({id:-1,name:'',port:'Veraval',portIdx:10,pgIdx:3,landType:'sopc',area:500,currentRent:5090,leaseStart:2022,leaseTerm:5,acqCr:0,indivVal:null,acqValPsqm:null,recYear:null,notes:''});
  }

  const TABS=['📊 Revenue Overview','📋 Detailed Matrix'];

  if (!unlocked) {
    return <PasswordGate onUnlock={function(){ setUnlocked(true); }}/>;
  }

  return (
    <div style={{background:'#f1f5f9',minHeight:'100vh',fontFamily:"'Inter',system-ui,sans-serif",fontSize:12}}>

      {/* HEADER */}
      <div style={{background:'#1e3a8a',padding:'8px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}>
        <div>
          <p style={{color:'#fff',fontSize:13,fontWeight:700,margin:0}}>GMB Land Policy — Revenue Impact Dashboard</p>
          <p style={{color:'#93c5fd',fontSize:9,margin:'2px 0 0'}}>{plots.length} plots · 4 land categories · 8 policy scenarios · Live IRR calculation</p>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={function(){setCpOpen(function(o){return !o;});}} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'rgba(255,255,255,0.12)',color:'#fff',border:'1px solid rgba(255,255,255,0.25)'}}>
            {cpOpen?'Hide Panel':'Show Panel'}
          </button>
          <button onClick={openAdd} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#22c55e',color:'#fff',border:'none',fontWeight:700}}>+ Add Plot</button>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 14px',display:'flex',gap:0}}>
        {TABS.map(function(t,i){
          const active=mainTab===i;
          return (
            <button key={i} onClick={function(){setMainTab(i);}}
              style={{fontSize:12,fontWeight:active?700:400,padding:'10px 18px',cursor:'pointer',background:'transparent',border:'none',
                borderBottom:active?'3px solid #1e40af':'3px solid transparent',
                color:active?'#1e40af':'#6b7280',transition:'all 0.15s'}}>
              {t}
            </button>
          );
        })}
      </div>

      <div style={{display:'flex',gap:10,padding:'10px 12px',alignItems:'flex-start'}}>

        {/* CONTROL PANEL */}
        {cpOpen && (
          <div style={{width:258,flexShrink:0}}>
            <ControlPanel c={ctrl} setC={setCtrl}/>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{flex:1,minWidth:0}}>
          {mainTab === 0 && <RevenueOverview computed={computed} bifurc={bifurc} ctrl={ctrl}/>}
          {mainTab === 1 && <DetailedMatrix computed={computed} onRowClick={function(row){setDetail(row);}}/>}
        </div>
      </div>

      {/* MODALS */}
      {editP && (
        <PlotEditor plot={editP} onSave={savePlot} onDelete={delPlot}
          onClose={function(){setEditP(null);setIsNew(false);}} isNew={isNew}/>
      )}
      {detail && (
        <RowDetail row={detail}
          onClose={function(){setDetail(null);}}
          onEdit={function(){setEditP(detail.p);setDetail(null);}}/>
      )}
    </div>
  );
}
