import { useState, useMemo, useCallback, Fragment } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const CY = 2025;
const PORT_NAMES = ['Alang','Bhavnagar','Jafrabad','Jamnagar','Magdalla','Mandvi','Mangrol','Navlakhi','Okha','Porbandar','Veraval','Dahej','Hazira','Mundra'];
const PG_IDX = {'Magdalla':0,'Dahej':0,'Hazira':0,'Bhavnagar':1,'Alang':1,'Navlakhi':1,'Jamnagar':2,'Okha':2,'Mundra':2,'Mandvi':2,'Veraval':3,'Porbandar':3,'Mangrol':3,'Jafrabad':3};
const PG_NAMES = ['South Gujarat Coast','Saurashtra East','Saurashtra West','South Saurashtra'];

const LPA_META = {
  "GAPL/APSEZL Mundra (3404 Acres)":    {start:2000,term:30,acqCr:7.00,  rec:false},
  "Hazira Port Pvt Ltd (409 Ha)":        {start:2007,term:30,acqCr:0.00,  rec:true, recYr:2007},
  "Petronet LNG Limited":                {start:1999,term:30,acqCr:9.70,  rec:false},
  "APPPL Dahej Plot 1":                  {start:2009,term:30,acqCr:2.71,  rec:false},
  "APPPL Dahej Plot 2":                  {start:2009,term:30,acqCr:2.31,  rec:false},
  "Swan LNG Pvt Ltd":                    {start:2017,term:30,acqCr:7.10,  rec:false},
  "Bhavnagar Port Infra Pvt Ltd":        {start:2024,term:30,acqCr:14.20, rec:false},
  "Nauyaan Shipyard Pvt Ltd":            {start:2025,term:30,acqCr:14.40, rec:false},
  "Modest Infrastructure Pvt Ltd":       {start:2007,term:30,acqCr:0.46,  rec:false},
};
const LPA_RENT = {
  "GAPL/APSEZL Mundra (3404 Acres)":10234000,
  "Hazira Port Pvt Ltd (409 Ha)":409,
  "Petronet LNG Limited":23436000,
  "APPPL Dahej Plot 1":23412000,
  "APPPL Dahej Plot 2":12571000,
  "Swan LNG Pvt Ltd":68030000,
  "Bhavnagar Port Infra Pvt Ltd":14798800,
  "Nauyaan Shipyard Pvt Ltd":14187745,
  "Modest Infrastructure Pvt Ltd":343800,
};

const SCEN_KEYS = ['sopc_cur','sopc_rev','opt1','opt2','opt3','opt4','opt5','opt6'];
const SCEN_META = {
  sopc_cur:{label:'SoPC Current (uniform)',  short:'SoPC Cur', color:'#1e40af', bg:'#dbeafe'},
  sopc_rev:{label:'SoPC Revised (uniform)',  short:'SoPC Rev', color:'#1d4ed8', bg:'#bfdbfe'},
  opt1:    {label:'Opt 1 — Fresh Val × %',   short:'Opt 1',    color:'#6d28d9', bg:'#ede9fe'},
  opt2:    {label:'Opt 2 — ×40%× %',         short:'Opt 2',    color:'#7c3aed', bg:'#f5f3ff'},
  opt3:    {label:'Opt 3 — Continue Old',    short:'Opt 3',    color:'#065f46', bg:'#d1fae5'},
  opt4:    {label:'Opt 4 — Last + WPI',      short:'Opt 4',    color:'#0f766e', bg:'#ccfbf1'},
  opt5:    {label:'Opt 5 — 50% Hike + WPI',  short:'Opt 5',    color:'#92400e', bg:'#fef3c7'},
  opt6:    {label:'Opt 6 — Block Step-up ✓', short:'Opt 6 ✓',  color:'#14532d', bg:'#bbf7d0'},
};
const TYPE_META = {
  sopc:               {label:'SoPC',      color:'#1e40af', bg:'#dbeafe'},
  lpa:                {label:'LPA',       color:'#6d28d9', bg:'#ede9fe'},
  reclaimed_pre2018:  {label:'Rec<2018',  color:'#92400e', bg:'#fef3c7'},
  reclaimed_post2018: {label:'Rec≥2018',  color:'#065f46', bg:'#d1fae5'},
};
const STATUS_META = {
  active:   {label:'Active',   color:'#065f46', bg:'#d1fae5'},
  expiring: {label:'<5 yrs',   color:'#92400e', bg:'#fef3c7'},
  expired:  {label:'Expired',  color:'#991b1b', bg:'#fee2e2'},
};
const TYPE_LABELS = {
  sopc:'SoPC Ordinary', lpa:'LPA Firm Land',
  reclaimed_pre2018:'Reclaimed Pre-2018', reclaimed_post2018:'Reclaimed Post-2018', total:'TOTAL'
};

// ═══════════════════════════════════════════════════════════════════
// RAW DATA  [area, portIdx, isLPA, name]
// ═══════════════════════════════════════════════════════════════════
const RAW = [
[800,0,0,"S&S Brothers"],[800,0,0,"Ushmaniya Oxygen"],[600,0,0,"Capital Oxygen"],[600,0,0,"Superior Air Products"],[800,0,0,"Aims Oxygen"],[600,0,0,"Sharma & Co"],[425,0,0,"Indian Red Cross"],[800,0,0,"SBS Bhavnagar"],[875,0,0,"Shirdi Steel Traders"],[875,0,0,"Gupta Steel Bhavnagar"],[240,0,0,"Dr M A Hamidani"],[600,0,0,"Hindustan Gas Indu"],[600,0,0,"Peckok Chemicals"],[800,0,0,"BM Shah Sons"],[300,0,0,"Pravin Vaja"],[304,0,0,"BSNL Alang Tower"],[441,0,0,"Bombay Weighbridge"],[964.5,0,0,"Manoharsinh Chauhan"],[3375,0,0,"Gujarat Gas Ltd"],
[590,1,0,"Chimanlal N Patel"],[416.58,1,0,"Keshavlal H Patel"],[744,1,0,"Nagindas N Patel"],[919.37,1,0,"JJ Patel Gas Agency"],[75000,1,0,"BVP Products Ltd"],[919.46,1,0,"HP Vitthalpara"],[899.4,1,0,"BK Mansatar"],[836.43,1,0,"HK Kamdar Sons"],[100,1,0,"Union Fair Scale"],[3442.5,1,0,"Mars Metal Oxides"],[928,1,0,"Namrata Gas Agency"],[250.61,1,0,"JM Baxi Co"],[791,1,0,"Jirawala Plastic"],[900,1,0,"Bharat Petroleum Bhvngr"],[196,1,0,"Dhandin Weighbridge"],[1400,1,0,"Sea Land Shipping"],[928,1,0,"Dilipsinh A Gohil"],[960,1,0,"Ushaben R Agrawal"],[2500,1,0,"Laxmi Toughened Glass"],[900,1,0,"Daxaben Manadalia"],[800,1,0,"Shrenik Sales Corp 1"],[2500,1,0,"Bhavna Marine Engg"],[1044,1,0,"Nileshkumar H Patel"],[750,1,0,"Jitendra M Vyas"],[215.8,1,0,"Abdul Razaq Lati"],[1800,1,0,"Mayurdhvajsinh Ghohil"],[682.84,1,0,"Kiritkumar H Patel"],[400,1,0,"Saurashtra Petroleums"],[800,1,0,"Param Plastic Inds"],[1000,1,0,"Police Stn Bhavnagar"],[9058,1,0,"JK Steel Alloys"],[1134,1,0,"Sea Services Pvt Ltd"],[900,1,0,"Heena Gases"],[1000,1,0,"Khamaba Gohil"],[222.71,1,0,"Vishalpara Girishkumar 1"],[155.04,1,0,"Vishalpara Girishkumar 2"],[547.2,1,0,"Nitinbhai Loriya"],[1800,1,0,"Kirit J Bhatt"],[4,1,0,"Reliance Jio Bhv 1"],[9,1,0,"Reliance Jio Bhv 2"],[2100,1,0,"Pravasini Joshi"],[1800,1,0,"Dhirajkumar Rajai"],[700,1,0,"Shrenik Sales Corp 2"],[1250,1,0,"Patanjali Marine Ghogha"],[10000,1,0,"Mahek Agro Mineral"],[1250,1,0,"Maya Marine Logistics"],[47432,1,1,"Bhavnagar Port Infra Pvt Ltd"],
[450,2,0,"Matsyodhyog Mandali Jafr"],[137,2,0,"Police Sub-Inspector Jafr"],[471120,2,1,"Swan LNG Pvt Ltd"],
[25,3,0,"Reliance Jio Bedi"],[600,3,0,"Shreeji Shipping NP"],[500,3,0,"Shreeji Shipping Bedi"],[23720,3,0,"Reliance Inds Sikka"],[600,3,0,"NK Parmar Co"],[7170,3,0,"Gujarat State Warehousing"],[25,3,0,"Reliance Jio Rozi"],[25,3,0,"Reliance Jio NP Jmn"],[227120,3,0,"Digvijay Cement Sikka"],[3600,3,0,"Shakti Clearing NP"],[500,3,0,"Vasuki Trade Link"],[55.35,3,0,"Directorate of Lighthouses"],[29071,3,0,"Shakti Clearing Wharf"],[1103.6,3,0,"Veer Dock Company"],[1063.21,3,0,"Custom Agents Assn"],[560,3,0,"Jamnagar Panjrapol 1"],[470,3,0,"Jamnagar Panjrapol 2"],[10156,3,0,"Integrated Proteins"],[750,3,0,"Salaya Machimar Mandli"],[1524,3,0,"Aziz J Charania"],
[22360,4,0,"Narmada Cement Co"],[210,4,0,"Gayatri Weighbridge Mgd"],[1700,4,0,"Ashwani Shipping Corp"],[300,4,0,"Guj Fisheries Umargam"],[300,4,0,"Guj Fisheries Kosamba"],[288501,4,1,"Nauyaan Shipyard Pvt Ltd"],[11460,4,1,"Modest Infrastructure Pvt Ltd"],
[1114,5,0,"Hindustan Petroleum Mndv"],[350,5,0,"Nurmamad H Sangani"],[660,5,0,"Gujarat Fisheries Jakhau"],[1225,5,0,"Zarpara Matsyodhyog"],[165,5,0,"Sara Engineering Works"],[38.2,5,0,"BSNL Jakhau"],[1000,5,0,"Adani Port Weighbridge"],
[1425,6,0,"Kalyan Ice Cold Storage"],
[1700,7,0,"Shivm Marine Services"],[4740,7,0,"Chaugule Co Salt"],[450,7,0,"Gayatri Weighbridge NLK"],[220,7,0,"BSNL Rajkot Tower"],[300,7,0,"Police Outpost Rajkot"],[233,7,0,"Indus Tower NLK"],
[400,8,0,"Pavanputra Fish Co-op 1"],[300,8,0,"Pavanputra Fish Co-op 2"],[750,8,0,"Adarsh Fish Co-op 1"],[750,8,0,"Adarsh Fish Co-op 2"],[12270,8,0,"Comm of Fisheries GKU"],[660,8,0,"SBI Okha"],[200,8,0,"Police Station Okha"],[900,8,0,"Coastal Marine Police Okha"],[1032,8,0,"Indian Roadlines Jmn"],
[256,9,0,"Sagar Sarvodaya Co-op"],[660,9,0,"Premilaben N Lodhari"],[300,9,0,"Associated Transport Co"],[256,9,0,"JaySagar Fishing Co-op"],[434,9,0,"RatnaSagar Ice Factory"],[35.55,9,0,"Nilamben K Kotiya"],[2460,9,0,"Agro Marine Guj Fish"],[459.02,9,0,"SagarSakti Fishing Co-op"],[315,9,0,"Hiren Enterprises"],[1352.81,9,0,"Mustaq Haji Siddik"],[428.41,9,0,"Deep Ice Industries"],[370,9,0,"Arjan Hira Lodhari"],[464,9,0,"Premji Kanji Lodhari 1"],[468,9,0,"Jivan Padhu Masani"],[346,9,0,"Narsi Kanji Jungi"],[601.18,9,0,"Rajmilan Transport"],[1250,9,0,"Suraj Ice Cold Storage"],[120.4,9,0,"SHV Energy LPG"],[371.58,9,0,"Dhansukh V Lodhari 1"],[320,9,0,"Pavanputra Fisheries 1"],[900,9,0,"Jaysagar Fisheries Co-op"],[468,9,0,"Ganesh Ice Factory"],[798,9,0,"Narsi Velji Lodhari"],[862.8,9,0,"Kanji Ramji Salet"],[748,9,0,"Bhikhu Velji Lodhari"],[360,9,0,"Kishore R Lodhari"],[519.2,9,0,"Bhimji Padhu Toraniya"],[584.85,9,0,"Vivek Matsyodhog Co-op"],[484,9,0,"Hiralal Babu Masani"],[225,9,0,"Paresh Narsi Jungi"],[240,9,0,"Savitaben Narsi Jungi"],[2161.54,9,0,"Chum Fresh Fish"],[930,9,0,"Jayaben P Lodhari 1"],[350,9,0,"Faruq Aftab Exports"],[286,9,0,"Narsi Babubhai Masani"],[135,9,0,"Narsi B Masani"],[400,9,0,"Rajdhani Fisheries Co-op"],[2100,9,0,"Gajraj Fish Shed"],[632,9,0,"Jitendra N Lodhari"],[300,9,0,"Vinod Premji Kotiya"],[227,9,0,"Madhavji B Motivaras"],[600,9,0,"Ruhi Frozen Foods"],[1560,9,0,"Rajesh Babulal Panjri"],[1400,9,0,"NK Jungi"],[850,9,0,"Premji Kanji Lodhari 2"],[251.2,9,0,"Dinesh Ramji Postariya"],[846,9,0,"Babulal J Khokhri"],[1710,9,0,"Alokkumar HN Tripathi"],[798,9,0,"Karsan Ramji Salet"],[480,9,0,"Velji Kanji Kotiya"],[175,9,0,"Pramilaben N Lodhari"],[600,9,0,"Velji Madhavji Salet"],[2593.5,9,0,"Saurastra Cement Ltd"],[1371.75,9,0,"Sunil Devshi Gohil"],[231.25,9,0,"Hiralal Padhu Jungi"],[1595.62,9,0,"Nagarpalika Fish Market"],[900,9,0,"Nagarpalika Mutton Market"],[3000,9,0,"Alokkumar Frozen Storage"],[500,9,0,"Marine Police PBR"],[5761.5,9,0,"Indian Navy Porbandar"],[1389.53,9,0,"Jadavbhai V Chudasama"],[1240.31,9,0,"Chhagan Gokal Lodhari"],[2988.29,9,0,"Amrut Cold Storage"],[80,9,0,"Siddik Yunush Sati"],[1500.29,9,0,"Mohan Hiralal Siyal"],[725,9,0,"Police Asmavati Ghat"],[2228.11,9,0,"Ramesh P Motivaras"],[1084.97,9,0,"Mohanlal P Motivaras"],[979.37,9,0,"Jayaben P Lodhari 2"],[600,9,0,"Pravinbhai B Masani 1"],[620.5,9,0,"Babubhai J KhoKhri"],[240,9,0,"Babubhai B KhoKhari"],[2198.18,9,0,"Harish Ramji Postaiya"],[330,9,0,"Harjivan K Kotiya"],[864.58,9,0,"Mohamedsiddiq Karatela"],[504,9,0,"Hirabhai N Khetalpal"],[1138.76,9,0,"West Coast Foods"],[600,9,0,"Harsh Sagar Mandli"],[535.6,9,0,"Kantaben D Kotiya"],[383.84,9,0,"Dhansukh K Badarsahi"],[600,9,0,"Shivangi Fisheries Co-op"],[1260,9,0,"Nitesh Arjunbhai Jungi"],[890,9,0,"Bhartiben R Gohel"],[350,9,0,"Pravinbhai B Masani 2"],[25,9,0,"RJIL Old Port 1"],[25,9,0,"RJIL Old Port 2"],[25,9,0,"RJIL Old Port 3"],[4360,9,0,"Honest Dry Fish"],[305.89,9,0,"Kamleshbhai B Gohel"],[733.54,9,0,"Nathalal Jungi"],[504,9,0,"Yunushbhai Y Afini"],[300,9,0,"Ajaybhai J Motivaras"],[1842.4,9,0,"Manishbhai J Motivaras"],[913.54,9,0,"Nidhi Sea Food"],[2685,9,0,"Taranhar Fresh Fish"],[234,9,0,"Riddhi Siddhi Sea Food"],[5933.02,9,0,"Silver Star Export"],[690,9,0,"Supdt Police Harbor"],[1110.93,9,0,"Jitendra Mepa Bharada"],[300,9,0,"Kishor Project Ltd"],[511,9,0,"Kush Trading"],[492.73,9,0,"Mitesh J Posatariya"],[960,9,0,"Monika Sea Foods"],[518.92,9,0,"Naran Babubhai Salet"],[586.72,9,0,"Khushbu Fresh Fish"],[80,9,0,"Vanitaben D Badarshahi 1"],[870.76,9,0,"Mahendra D Madhvi"],[300,9,0,"Bipin Fish"],[275.52,9,0,"Kiran J Chudasama"],[150,9,0,"Vanitaben D Badarshahi 2"],[2049.36,9,0,"Ekta Fisheries Co-op"],[960,9,0,"Rajesh Babulal Panjari"],[54.05,9,0,"Jayesh J Shiyal"],[4192,9,0,"Silver Fish Sterilizer"],[1150,9,0,"Prakashbhai R Shiyal"],[400,9,0,"Milan Matsyaudyog Sahakari"],
[705,10,0,"Vikas Agency"],[1350,10,0,"Vijay M Rughani"],[675,10,0,"Ibrahim A Turaq"],[1350,10,0,"Vinodchandra V"],[675,10,0,"Somnath Band Saw Mill"],[578.88,10,0,"Divya Ice Cold Storage"],[562.5,10,0,"Shitlakrupa Ice Storage"],[562.5,10,0,"Anjali Ice Cold Storage"],[675,10,0,"S Pradipkumar Maganlal"],[675,10,0,"Shivam Ice Factory"],[631.5,10,0,"Kamet Ice Industries"],[633.75,10,0,"Veravali Krupa Ice"],[705,10,0,"Kailash Ice Factory"],[675.59,10,0,"Vishnulaxmi Ice Factory"],[637.5,10,0,"JK Ice Factory"],[675,10,0,"Becharlal Devji Thanki"],[709.5,10,0,"Minaxi Ice Cold Storage"],[641.25,10,0,"Himalaya Ice Cold Storage"],[470,10,0,"Sunil Ice Factory"],[1350,10,0,"Babubhai N Vadhavi"],[300.04,10,0,"Veraval Petroleums 1"],[705,10,0,"Parsottam B Kanabar"],[675,10,0,"Arvindkumar Ranchhoddas"],[649.5,10,0,"Subham Ice Product"],[705,10,0,"Shubham Product"],[657.37,10,0,"Cham Trading Org"],[705,10,0,"Lavji Parmanand Co"],[707.94,10,0,"Radheshyam Ice Storage"],[225,10,0,"Narayan Workshop"],[1800,10,0,"Dinesh Meghaji Fofandi"],[586.05,10,0,"Rahul Marine Enterprises"],[899.08,10,0,"Mugal Kaluhusen"],[637.5,10,0,"Mahamad Faruk Janmahamad"],[525,10,0,"Kalpana Marine Agency"],[525,10,0,"GB Corporation"],[900,10,0,"Mohan Damji Bhesla"],[546.38,10,0,"JaiAmbe Ice Factory"],[439.13,10,0,"Harikrupa Ice Factory"],[406.88,10,0,"Jiaijalaram Ice Factory"],[374.63,10,0,"Mehul Diesel Works"],[362.08,10,0,"Jalaram Workshop"],[385.13,10,0,"Rajmoti Ice Cold Storage"],[352.87,10,0,"Kaushal Engineering"],[320.63,10,0,"Nathalal Nagji Koria"],[290,10,0,"Gujarat Marble"],[181.13,10,0,"Rameshwari Engineering"],[133.66,10,0,"Sagardeep Marine Spares"],[61.8,10,0,"Priyank Engineering"],[35.84,10,0,"MP Vaghela"],[449.5,10,0,"Om Ice Factory"],[563.07,10,0,"Narayan Ice Factory VRL"],[500,10,0,"Trivedi Sons Weighbridge"],[600,10,0,"Gangasagar Ice 23-1"],[600,10,0,"Ashaganga Ice 23-2"],[550,10,0,"Keval Exports 24"],[588.5,10,0,"Kanaiya Ice Cold Storage"],[900,10,0,"Keval Exports 26"],[900,10,0,"Rajdhani Ice Factory VRL"],[500,10,0,"Indian Sea Foods"],[600,10,0,"Avdhesh Ice Factory"],[300,10,0,"Haripanth Ice Factory"],[1200,10,0,"Manish Sea Foods"],[548.5,10,0,"Ashwin Ice Factory"],[581,10,0,"Ridhhi Sidhdhi Ice"],[600,10,0,"Krishna Ice Factory 34"],[500,10,0,"Jentibhai R Koriya"],[375,10,0,"Parag Ice Factory"],[450,10,0,"Shrinathji Ice Storage"],[450,10,0,"Radhe Ice Cold Storage"],[464.25,10,0,"Jai Mahakal Ice Storage"],[448,10,0,"Chamunda Ice Products"],[420,10,0,"Chamunda Ice Cold Storage"],[420,10,0,"Maruti Ice Factory"],[350,10,0,"Diwaliben B Tank"],[706.38,10,0,"Bhagvati Ice Factory"],[555,10,0,"Shivshakti Ice Factory"],[247.5,10,0,"JitendraKumar L Suyani"],[421.13,10,0,"Parishram Spares Workshop"],[416.6,10,0,"Ramabhai D Barad"],[446.25,10,0,"Ratnaker Ice Cold Storage"],[448.2,10,0,"Balaji Workshop"],[374.63,10,0,"Kishan Damji Bhesla"],[601.11,10,0,"Vanita Cold Storage 52-53"],[831.7,10,0,"Vanita Cold Storage 54-55"],[831.7,10,0,"Krishna Ice Factory 58"],[831.7,10,0,"Khodiyar Ice Factory"],[90,10,0,"Kiran Electrical Engg"],[667.32,10,0,"Vanita Cold Storage 56-57"],[846.99,10,0,"Shivshakti Marine Engg"],[396.99,10,0,"Makwana Re-powering Wks"],[1500,10,0,"Monark Sea Foods"],[1770,10,0,"Hindustan Petroleums VRL"],[988,10,0,"Deepmala Marine Exports 5"],[990,10,0,"Deepmala Marine Exports 6"],[1976,10,0,"Saraswati Ice Cold Storage C"],[532,10,0,"Gangasagar Ice Factory C"],[1300,10,0,"Veraval Industries Assn"],[376,10,0,"Trikamlal Devji Gohel"],[324,10,0,"Naran Karshan Malam"],[1774.18,10,0,"Veraval Samsat Ghyanti"],[928.88,10,0,"Iswarprakash Ice FH-1"],[449.84,10,0,"GFCCA Ltd FH Partial"],[3020,10,0,"Castle Rock Sea Foods 2"],[3020,10,0,"Castle Rock Sea Foods 3"],[3236.55,10,0,"Castle Rock Cold Storage"],[2531.61,10,0,"Cent Inst Fisheries Tech"],[3442.01,10,0,"Kalpataru Exports Fofandi"],[2950,10,0,"BMG Fisheries FH"],[2229.67,10,0,"Bhavani Sea Foods FH-9"],[2229.76,10,0,"Maruti Krupa Ice Storage"],[3922,10,0,"Alana Frozen Foods FH-17"],[595,10,0,"Shakti Ice FH-22"],[1005,10,0,"Parishram Ice FH-23-24"],[310,10,0,"GFCCA Ltd Fueling"],[55.74,10,0,"Babubhai R Jungi"],[55.74,10,0,"Madhu Damji Khapandi"],[760,10,0,"Chandra Marine Machinery"],[660,10,0,"Urmi Marine Engg Wks"],[2960,10,0,"Fisheries Dept Service Stn"],[3810.94,10,0,"Bhavani Sea Foods FH-38"],[2010,10,0,"Gopal Fisheries FH-44"],[743.22,10,0,"Gopal Fisheries FH-47"],[873.47,10,0,"Bhavani Sea Foods FH-48"],[2607.56,10,0,"Hariom Ice Cold Storage"],[288,10,0,"Saraswati Ice FH-57"],[1660,10,0,"Deepmala Marine FH-58"],[180,10,0,"Virmlaben M Suyani"],[67.38,10,0,"Mansukhlal R Suyani"],[67.1,10,0,"Jamnadas Hemraj Dodia"],[70,10,0,"Somnath Marine Spares"],[80,10,0,"Pithadia Freezing 64"],[74.32,10,0,"Harilal Virji Pithadia"],[214.5,10,0,"Pithadiya Frizing 66-68"],[1160.83,10,0,"Dinesh Sea Foods FH-16"],[99.98,10,0,"Rameshchandra A Fofandi"],[2859.15,10,0,"Iswarprakash Ice FH-36"],[1002.93,10,0,"Anurag Sea Foods"],[1670.78,10,0,"Elite Ship Yard"],[1989.53,10,0,"Veraval Shipping Corp"],[625,10,0,"Jai Sagar Co-op Diesel"],[1168.21,10,0,"RJ Trivedi Sons"],[4935.94,10,0,"VRL Machchhi Kharid Vechan"],[208.82,10,0,"Vallabh Haridas Oil Cake"],[400,10,0,"GFCCA Ltd Navabander"],[450,10,0,"Jafrabad Machhi Khari Sangh"],[743.59,10,0,"Faruq Mohamed Pirani"],[49.92,10,0,"Trikamlal N Agya"],[1114,10,0,"GFCCA Ltd Ice Factory Misc"],[800,10,0,"Parishram Mastyodhyog Co-op"],[604.08,10,0,"Jalaram Ice Factory Misc"],[94.84,10,0,"Kharva Machhimar Assn"],[9840,10,0,"GFCCA Ltd Boat Building"],[185.92,10,0,"Sorathiya Traders"],[540.96,10,0,"Babu Jamal Patni"],[557.69,10,0,"Iqubal Haji Ibrahim"],[625,10,0,"Mahesh Saw Mills VRL"],[321.5,10,0,"Bharat Computer WB"],[4141,10,0,"Coast Guard Godown"],[1993.39,10,0,"Bharat Petroleum Diesel"],[23886.68,10,0,"Sorath Onion Merchant Assn"],[1000,10,0,"Marine Police Navabandar"],[2000,10,0,"Mansukh R Suyani Misc"],[200,10,0,"Chamunda Ice Misc"],[841.66,10,0,"Honest Ice Cold Storage"],[300.04,10,0,"Veraval Petroleums Hanuman"],[720,10,0,"Chandrakant Co"],[375,10,0,"Ganesh Sagar Petroleum"],
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
function slabI(area, b) {
  return area <= b[0] ? 0 : area <= b[1] ? 1 : area <= b[2] ? 2 : 3;
}
function calcIRR(cfs) {
  if (!cfs || cfs.length < 2) return null;
  let r = 0.08;
  for (let i = 0; i < 250; i++) {
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
    else { const ppe = y - yToExp; cfs.push(yr1 * Math.pow(1 + g, ppe - 1)); }
  }
  cfs[cfs.length - 1] += residual;
  return cfs;
}
function fmtCr(v) {
  const c = v / 1e7;
  if (c >= 100) return '₹' + c.toFixed(0) + ' Cr';
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
  return a >= 10000
    ? (a / 10000).toFixed(2) + ' Ha'
    : a.toLocaleString('en-IN', {maximumFractionDigits:0}) + ' sqm';
}

// ═══════════════════════════════════════════════════════════════════
// BUILD INITIAL PLOTS
// ═══════════════════════════════════════════════════════════════════
let _id = 0;
function buildPlots() {
  return RAW.map(function(row) {
    const area = row[0], portIdx = row[1], isLPA = row[2], name = row[3];
    const port = PORT_NAMES[portIdx];
    const pgIdx = PG_IDX[port] !== undefined ? PG_IDX[port] : 0;
    const meta = isLPA ? LPA_META[name] : null;
    const rec = meta && meta.rec ? true : false;
    const landType = isLPA ? (rec ? 'reclaimed_pre2018' : 'lpa') : 'sopc';
    const currentRent = isLPA ? (LPA_RENT[name] || 0) : (area / 10) * 1018;
    return {
      id: _id++, name, port, portIdx, pgIdx, landType, area,
      currentRent,
      leaseStart: meta ? meta.start : 2015,
      leaseTerm:  meta ? meta.term  : (isLPA ? 30 : 5),
      acqCr:      meta ? meta.acqCr : 0,
      indivVal:     null,
      acqValPsqm:   null,
      recYear: meta && meta.recYr ? meta.recYr : null,
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
  freshPct:6,
  escType:'20pct3yr', escPct:20, escPeriod:3, wpiRate:6,
  blockPct:50, blockYrs:15, numBlocks:3,
  reclPct:20, rebateYrs:10, rebateDiscount:50,
  holdoverOn:false, penaltyMult:3,
  irrHorizon:30, residualPct:100,
};

// ═══════════════════════════════════════════════════════════════════
// SHARED STYLES (plain objects only — no JSX)
// ═══════════════════════════════════════════════════════════════════
const INP  = {border:'0.5px solid #d1d5db',borderRadius:4,padding:'3px 7px',fontSize:11,background:'#fff',color:'#111',width:80};
const SEL  = {border:'0.5px solid #d1d5db',borderRadius:4,padding:'3px 6px',fontSize:11,background:'#fff',color:'#111'};
const TH   = {fontSize:10,fontWeight:600,color:'#6b7280',padding:'5px 6px',textAlign:'left',background:'#f9fafb',borderBottom:'0.5px solid #e5e7eb',whiteSpace:'nowrap'};
const TD   = {fontSize:11,padding:'4px 6px',borderBottom:'0.5px solid #f3f4f6',verticalAlign:'middle'};
function btnStyle(active, col) {
  return {fontSize:11,padding:'4px 12px',borderRadius:4,cursor:'pointer',border:'none',
    background: active ? (col || '#1e40af') : '#f3f4f6',
    color: active ? '#fff' : '#374151',
    fontWeight: active ? 600 : 400};
}
function badgeStyle(color, bg) {
  return {fontSize:9,padding:'2px 6px',borderRadius:10,background:bg,color,fontWeight:600,display:'inline-block'};
}

// ═══════════════════════════════════════════════════════════════════
// PLOT EDITOR MODAL
// ═══════════════════════════════════════════════════════════════════
function PlotEditor({ plot, onSave, onDelete, onClose, isNew }) {
  const [f, setF] = useState(Object.assign({}, plot));

  function updStr(k) {
    return function(e) { setF(function(p) { return Object.assign({}, p, {[k]: e.target.value}); }); };
  }
  function updNum(k) {
    return function(e) {
      const v = e.target.value === '' ? null : +e.target.value;
      setF(function(p) { return Object.assign({}, p, {[k]: v}); });
    };
  }
  function updPort(e) {
    const port = e.target.value;
    const portIdx = PORT_NAMES.indexOf(port);
    const pgIdx = PG_IDX[port] !== undefined ? PG_IDX[port] : 0;
    setF(function(p) { return Object.assign({}, p, {port, portIdx, pgIdx}); });
  }

  return (
    <div
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}
    >
      <div style={{background:'#fff',borderRadius:12,padding:'1.25rem',width:430,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontWeight:700,fontSize:13,color:'#111'}}>{isNew ? '+ Add New Plot' : 'Edit Plot'}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
        </div>

        {[
          ['Lessee / Plot Name', <input key="name" style={Object.assign({},INP,{width:220})} type="text" value={f.name} onChange={updStr('name')}/>],
          ['Port', <select key="port" style={SEL} value={f.port} onChange={updPort}>{PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}</select>],
          ['Land Type', <select key="lt" style={SEL} value={f.landType} onChange={updStr('landType')}>
            <option value="sopc">SoPC (Ordinary)</option>
            <option value="lpa">LPA (Firm / Greenfield)</option>
            <option value="reclaimed_pre2018">Reclaimed Land Pre-2018</option>
            <option value="reclaimed_post2018">Reclaimed Land Post-2018</option>
          </select>],
          ['Area (sqm)', <input key="area" style={INP} type="number" value={f.area} onChange={updNum('area')}/>],
          ['Current Rent (₹/yr)', <input key="cr" style={Object.assign({},INP,{width:130})} type="number" value={f.currentRent} onChange={updNum('currentRent')}/>],
          ['Lease Start Year', <input key="ls" style={INP} type="number" value={f.leaseStart} onChange={updNum('leaseStart')}/>],
          ['Lease Term (yrs)', <input key="lt2" style={INP} type="number" value={f.leaseTerm} onChange={updNum('leaseTerm')}/>],
          ['Acquisition Cost (₹ Cr)', <input key="ac" style={INP} type="number" value={f.acqCr || ''} onChange={updNum('acqCr')}/>],
          ['Indiv. Jantri Val (₹/sqm)', <input key="iv" style={INP} type="number" placeholder="group default" value={f.indivVal || ''} onChange={updNum('indivVal')}/>],
          ['Hist. Acq. Cost (₹/sqm)', <input key="av" style={INP} type="number" placeholder="group default" value={f.acqValPsqm || ''} onChange={updNum('acqValPsqm')}/>],
          ['Notes', <input key="no" style={Object.assign({},INP,{width:220})} type="text" value={f.notes} onChange={updStr('notes')}/>],
        ].map(function(pair) {
          return (
            <div key={pair[0]} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
              <span style={{fontSize:11,color:'#6b7280',minWidth:135,flexShrink:0}}>{pair[0]}</span>
              {pair[1]}
            </div>
          );
        })}
        {(f.landType === 'reclaimed_pre2018' || f.landType === 'reclaimed_post2018') && (
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
            <span style={{fontSize:11,color:'#6b7280',minWidth:135}}>Reclamation Year</span>
            <input style={INP} type="number" value={f.recYear || ''} onChange={updNum('recYear')}/>
          </div>
        )}

        <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:14,paddingTop:10,borderTop:'0.5px solid #e5e7eb'}}>
          {!isNew && (
            <button onClick={function() { if (window.confirm('Delete this plot?')) onDelete(plot.id); }} style={Object.assign({},btnStyle(false),{color:'#dc2626'})}>Delete</button>
          )}
          <button onClick={onClose} style={btnStyle(false)}>Cancel</button>
          <button onClick={function() { onSave(Object.assign({}, f, {id: plot.id})); }} style={btnStyle(true,'#1e40af')}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROW DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
function RowDetail({ row, onClose, onEdit }) {
  const p = row.p;
  const existing = row.existing;
  const rents = row.rents;
  const irrs = row.irrs;
  const tm = TYPE_META[p.landType] || TYPE_META.sopc;
  const sm = STATUS_META[p.status] || STATUS_META.active;

  return (
    <div
      onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'flex',alignItems:'flex-start',justifyContent:'flex-end'}}
    >
      <div style={{background:'#fff',width:500,height:'100%',overflowY:'auto',padding:'1.25rem',boxShadow:'-10px 0 40px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div>
            <p style={{fontWeight:700,fontSize:13,margin:0,color:'#111'}}>{p.name}</p>
            <p style={{fontSize:11,color:'#6b7280',margin:'3px 0 0'}}>{p.port} &nbsp;·&nbsp; {fmtA(p.area)} &nbsp;·&nbsp;
              <span style={badgeStyle(tm.color, tm.bg)}>{tm.label}</span>
              &nbsp;<span style={badgeStyle(sm.color, sm.bg)}>{sm.label}</span>
            </p>
          </div>
          <div style={{display:'flex',gap:5}}>
            <button onClick={onEdit} style={btnStyle(true,'#6d28d9')}>Edit</button>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9ca3af'}}>×</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:12}}>
          {[
            ['Lease Start',   p.leaseStart],
            ['Lease Expiry',  p.expiry],
            ['Years Left',    p.yearsLeft > 0 ? p.yearsLeft : 'Expired'],
            ['Acq. Cost',     p.acqCr ? '₹' + p.acqCr + ' Cr' : '—'],
            ['Jantri Val',    row.pv ? '₹' + row.pv.toLocaleString('en-IN') + '/sqm' : '—'],
            ['Existing Rent', fmtCr(existing)],
          ].map(function(item) {
            return (
              <div key={item[0]} style={{background:'#f9fafb',borderRadius:6,padding:'6px 8px'}}>
                <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{item[0]}</p>
                <p style={{fontSize:11,fontWeight:500,margin:'2px 0 0',color:'#111'}}>{item[1]}</p>
              </div>
            );
          })}
        </div>

        <p style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:6}}>Impact across all 8 scenarios</p>
        <p style={{fontSize:10,color:'#6b7280',marginBottom:8}}>
          IRR(Actual) = return on GMB's real acquisition spend &nbsp;|&nbsp;
          IRR(Revalued) = return on today's Jantri value
        </p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr>
                {['Scenario','Proposed Rent','₹ Change','% Change','Times','IRR (Actual)','IRR (Revalued)'].map(function(h) {
                  return <th key={h} style={Object.assign({},TH,{textAlign: h==='Scenario'?'left':'right'})}>{h}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {SCEN_KEYS.map(function(k) {
                const sm2 = SCEN_META[k];
                const r   = rents[k];
                const ir  = irrs[k];
                const diff = r - existing;
                const isPos = diff >= 0;
                return (
                  <tr key={k} style={{background:'#fff'}}>
                    <td style={TD}><span style={badgeStyle(sm2.color, sm2.bg)}>{sm2.short}</span></td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtCr(r)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:isPos?'#065f46':'#991b1b',fontWeight:600})}>
                      {diff >= 0 ? '+' : ''}{fmtCr(Math.abs(diff))}
                    </td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:isPos?'#065f46':'#991b1b',fontWeight:700})}>{fmtChg(r,existing)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',color:'#374151'})}>{fmtMx(r,existing)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.actual>0.08?'#065f46':'#92400e'})}>{fmtPct(ir ? ir.actual : null)}</td>
                    <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',color:ir&&ir.rev>0.04?'#065f46':'#6b7280'})}>{fmtPct(ir ? ir.rev : null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {p.acqCr === 0 && (
          <p style={{fontSize:10,color:'#9ca3af',marginTop:8}}>
            IRR(Actual) uses port-group historical cost (₹{row.acqPsqm}/sqm). Enter individual Acquisition Cost in Edit for precise IRR.
          </p>
        )}
        {p.notes && <p style={{fontSize:10,color:'#6b7280',marginTop:8}}>Note: {p.notes}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CONTROL PANEL SECTION
// ═══════════════════════════════════════════════════════════════════
function CPSection({ label, open, onToggle, children }) {
  return (
    <div style={{borderBottom:'0.5px solid #f3f4f6'}}>
      <button
        onClick={onToggle}
        style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',
          padding:'7px 10px',background:open?'#eff6ff':'transparent',border:'none',
          cursor:'pointer',fontSize:11,fontWeight:600,color:'#1e40af',textAlign:'left'}}
      >
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
      <span style={{fontSize:10,color:'#6b7280',flex:1}}>{label}</span>
      <div style={{flexShrink:0}}>{children}</div>
    </div>
  );
}

function SliderNum({ val, min, max, step, color, onChange }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:4}}>
      <input type="range" min={min} max={max} step={step||1} value={val}
        onChange={function(e){onChange(+e.target.value);}}
        style={{width:80, accentColor: color||'#1e40af'}}/>
      <span style={{fontSize:10,fontWeight:700,minWidth:36,textAlign:'right'}}>{val}</span>
    </div>
  );
}

function ControlPanel({ c, setC }) {
  const [open, setOpen] = useState({rates:true,pvals:false,slab:false,fresh:true,esc:true,opt6:true,recl:true,hold:false,irr:false});
  function tog(k) { setOpen(function(o) { return Object.assign({},o,{[k]:!o[k]}); }); }
  function upd(k) { return function(v) { setC(function(p) { return Object.assign({},p,{[k]:v}); }); }; }
  function updArr(k, i) {
    return function(v) {
      setC(function(p) {
        const a = p[k].slice();
        a[i] = +v;
        return Object.assign({},p,{[k]:a});
      });
    };
  }

  const annG = getAnnGrowth(c);

  return (
    <div style={{background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,overflow:'hidden',fontSize:11}}>
      <div style={{background:'#1e3a8a',padding:'8px 10px'}}>
        <p style={{color:'#fff',fontSize:12,fontWeight:700,margin:0}}>⚙️ Control Panel</p>
        <p style={{color:'#93c5fd',fontSize:9,margin:'2px 0 0'}}>All changes update live</p>
      </div>

      <CPSection label="A — SoPC Rates" open={open.rates} onToggle={function(){tog('rates');}}>
        <CPRow label="SoPC Current (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcCurRate} onChange={function(e){upd('sopcCurRate')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="SoPC Revised (₹/10sqm)">
          <input type="number" style={INP} value={c.sopcRevRate} onChange={function(e){upd('sopcRevRate')(+e.target.value);}}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',margin:'4px 0 0'}}>Current: ₹{(c.sopcCurRate/10).toFixed(1)}/sqm/yr &nbsp;|&nbsp; Revised: ₹{(c.sopcRevRate/10).toFixed(1)}/sqm/yr</p>
      </CPSection>

      <CPSection label="B — Port Valuations (₹/sqm)" open={open.pvals} onToggle={function(){tog('pvals');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Group Jantri (Opt 1,2) — individual plot override via Edit</p>
        {PG_NAMES.map(function(g,i) {
          return <CPRow key={g} label={g}><input type="number" style={INP} value={c.pgVals[i]} onChange={function(e){updArr('pgVals',i)(+e.target.value);}}/></CPRow>;
        })}
        <p style={{fontSize:9,color:'#6b7280',margin:'8px 0 4px'}}>Historical Acq. Cost ₹/sqm (for IRR-Actual):</p>
        {PG_NAMES.map(function(g,i) {
          return <CPRow key={g+'a'} label={g}><input type="number" style={INP} value={c.pgAcqPsqm[i]} onChange={function(e){updArr('pgAcqPsqm',i)(+e.target.value);}}/></CPRow>;
        })}
      </CPSection>

      <CPSection label="C — Slab Configuration" open={open.slab} onToggle={function(){tog('slab');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>Applies to Opt 1 and Opt 2 for all land types</p>
        {[0,1,2].map(function(i){
          return (
            <CPRow key={i} label={'Slab ' + ['I→II','II→III','III→IV'][i] + ' boundary (sqm)'}>
              <input type="number" style={INP} value={c.slabBounds[i]} onChange={function(e){updArr('slabBounds',i)(+e.target.value);}}/>
            </CPRow>
          );
        })}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
          {['I','II','III','IV'].map(function(l,i){
            const bg = ['#dbeafe','#d1fae5','#fef3c7','#fee2e2'][i];
            const ac = ['#1e40af','#065f46','#92400e','#991b1b'][i];
            return (
              <div key={l} style={{background:bg,borderRadius:6,padding:'6px 8px'}}>
                <p style={{fontSize:9,color:'#374151',margin:'0 0 4px',fontWeight:700}}>Slab {l}</p>
                <div style={{marginBottom:3}}>
                  <span style={{fontSize:9,color:'#6b7280'}}>Rent %</span>
                  <SliderNum val={c.slabPcts[i]} min={0} max={150} step={5} color={ac} onChange={updArr('slabPcts',i)}/>
                </div>
                <div>
                  <span style={{fontSize:9,color:'#6b7280'}}>Util %</span>
                  <SliderNum val={c.slabUF[i]} min={10} max={100} step={5} color="#888" onChange={updArr('slabUF',i)}/>
                </div>
              </div>
            );
          })}
        </div>
      </CPSection>

      <CPSection label="D — Fresh Valuation % (Opt 1 & 2)" open={open.fresh} onToggle={function(){tog('fresh');}}>
        <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>One selection drives both columns simultaneously</p>
        <div style={{display:'flex',gap:6,marginBottom:6}}>
          {[1.5,6,10].map(function(v){
            return <button key={v} onClick={function(){upd('freshPct')(v);}} style={Object.assign({},btnStyle(c.freshPct===v,'#6d28d9'),{flex:1})}>{v}%</button>;
          })}
        </div>
        <p style={{fontSize:9,color:'#9ca3af'}}>Opt 1 = Val × {c.freshPct}% × slab × util &nbsp;|&nbsp; Opt 2 = Val × 40% × {c.freshPct}% × slab × util</p>
      </CPSection>

      <CPSection label="E — Escalation (Opt 3–6)" open={open.esc} onToggle={function(){tog('esc');}}>
        <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
          {[['10pct3yr','10%/3yr'],['20pct3yr','20%/3yr'],['wpi','WPI%'],['custom','Custom']].map(function(pair){
            return <button key={pair[0]} onClick={function(){upd('escType')(pair[0]);}} style={Object.assign({},btnStyle(c.escType===pair[0],'#065f46'),{fontSize:10,padding:'3px 8px'})}>{pair[1]}</button>;
          })}
        </div>
        {c.escType === 'wpi' && (
          <CPRow label="WPI Rate (%)">
            <input type="number" style={INP} value={c.wpiRate} step={0.5} onChange={function(e){upd('wpiRate')(+e.target.value);}}/>
          </CPRow>
        )}
        {c.escType === 'custom' && (
          <div>
            <CPRow label="Escalation (%)">
              <input type="number" style={INP} value={c.escPct} onChange={function(e){upd('escPct')(+e.target.value);}}/>
            </CPRow>
            <CPRow label="Every N years">
              <input type="number" style={INP} value={c.escPeriod} min={1} max={10} onChange={function(e){upd('escPeriod')(+e.target.value);}}/>
            </CPRow>
          </div>
        )}
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Annual equivalent: {(annG * 100).toFixed(2)}% p.a.</p>
      </CPSection>

      <CPSection label="F — Option 6 Block Settings" open={open.opt6} onToggle={function(){tog('opt6');}}>
        <CPRow label="Block step-up %">
          <SliderNum val={c.blockPct} min={10} max={150} step={5} color="#14532d" onChange={upd('blockPct')}/>
        </CPRow>
        <CPRow label="Block duration (yrs)">
          <input type="number" style={INP} value={c.blockYrs} min={5} max={30} onChange={function(e){upd('blockYrs')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="Number of blocks">
          <input type="number" style={INP} value={c.numBlocks} min={1} max={5} onChange={function(e){upd('numBlocks')(+e.target.value);}}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Post-term coverage: {c.blockYrs * c.numBlocks} yrs &nbsp;|&nbsp; Total tenure: {30 + c.blockYrs * c.numBlocks} yrs</p>
      </CPSection>

      <CPSection label="G — Reclaimed Land" open={open.recl} onToggle={function(){tog('recl');}}>
        <CPRow label="% of firm land rent">
          <SliderNum val={c.reclPct} min={0} max={100} step={5} color="#92400e" onChange={upd('reclPct')}/>
        </CPRow>
        <CPRow label="Rebate period (yrs)">
          <SliderNum val={c.rebateYrs} min={0} max={20} step={1} color="#888" onChange={upd('rebateYrs')}/>
        </CPRow>
        <CPRow label="Rebate sub-discount %">
          <SliderNum val={c.rebateDiscount} min={0} max={100} step={10} color="#888" onChange={upd('rebateDiscount')}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          Pre-2018 base: ₹1/Ha &nbsp;|&nbsp; Post-2018: ₹1,000/Ha<br/>
          After rebate: {c.reclPct}% of firm land rent<br/>
          During rebate: {(c.reclPct * c.rebateDiscount / 100).toFixed(1)}% of firm land rent
        </p>
      </CPSection>

      <CPSection label="H — Holdover / Penalty" open={open.hold} onToggle={function(){tog('hold');}}>
        <label style={{fontSize:11,color:'#374151',display:'flex',alignItems:'center',gap:6,cursor:'pointer',marginBottom:6}}>
          <input type="checkbox" checked={c.holdoverOn} onChange={function(e){upd('holdoverOn')(e.target.checked);}}/>
          Apply holdover penalty to expired leases
        </label>
        {c.holdoverOn && (
          <div>
            <p style={{fontSize:9,color:'#9ca3af',marginBottom:6}}>As per LMR — expired leases show penalised rent in Existing column</p>
            <CPRow label="Penalty multiplier">
              <SliderNum val={c.penaltyMult} min={1} max={6} step={0.5} color="#991b1b" onChange={upd('penaltyMult')}/>
            </CPRow>
          </div>
        )}
      </CPSection>

      <CPSection label="I — IRR Settings" open={open.irr} onToggle={function(){tog('irr');}}>
        <CPRow label="Horizon (years)">
          <input type="number" style={INP} value={c.irrHorizon} min={5} max={75} onChange={function(e){upd('irrHorizon')(+e.target.value);}}/>
        </CPRow>
        <CPRow label="Residual val at horizon">
          <SliderNum val={c.residualPct} min={0} max={300} step={10} color="#1e40af" onChange={upd('residualPct')}/>
        </CPRow>
        <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>
          IRR(Actual) = GMB's return on actual land purchase cost<br/>
          IRR(Revalued) = return if acquired at today's Jantri value
        </p>
      </CPSection>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [ctrl,  setCtrl]  = useState(DEF_CTRL);
  const [plots, setPlots] = useState(INIT_PLOTS);
  const [editP, setEditP] = useState(null);
  const [detail,setDetail]= useState(null);
  const [isNew, setIsNew] = useState(false);
  const [search,setSearch]= useState('');
  const [filt,  setFilt]  = useState({land:'All',port:'All',status:'All',impact:'All'});
  const [sortK, setSortK] = useState('impact');
  const [pg,    setPg]    = useState(0);
  const [cpOpen,setCpOpen]= useState(true);
  const PGS = 25;

  // ── COMPUTE ENGINE ──────────────────────────────────────────────
  const computed = useMemo(function() {
    const g = getAnnGrowth(ctrl);
    return plots.map(function(p) {
      const pv       = p.indivVal || ctrl.pgVals[p.pgIdx] || 3000;
      const acqPsqm  = p.acqValPsqm || ctrl.pgAcqPsqm[p.pgIdx] || 300;
      const invA     = p.acqCr > 0 ? p.acqCr * 1e7 : p.area * acqPsqm;
      const invR     = p.area * pv;
      const slFact   = margF(p.area, ctrl.slabBounds, ctrl.slabPcts) / 100;
      const uf       = ctrl.slabUF[slabI(p.area, ctrl.slabBounds)] / 100;
      const expiry   = (p.leaseStart || CY) + (p.leaseTerm || 30);
      const yearsLeft= expiry - CY;
      const status   = yearsLeft > 5 ? 'active' : yearsLeft > 0 ? 'expiring' : 'expired';
      const isRec    = p.landType === 'reclaimed_pre2018' || p.landType === 'reclaimed_post2018';
      const reclF    = isRec ? ctrl.reclPct / 100 : 1;
      const rebateOn = isRec && p.recYear && (CY - p.recYear) < ctrl.rebateYrs;
      const effReclF = rebateOn ? reclF * (ctrl.rebateDiscount / 100) : reclF;

      const baseExist= p.currentRent;
      const existing = (ctrl.holdoverOn && status === 'expired') ? baseExist * ctrl.penaltyMult : baseExist;

      function firmRent(k) {
        if (k === 'sopc_cur') return (p.area / 10) * ctrl.sopcCurRate;
        if (k === 'sopc_rev') return (p.area / 10) * ctrl.sopcRevRate;
        if (k === 'opt1')     return p.area * pv * (ctrl.freshPct / 100) * slFact * uf;
        if (k === 'opt2')     return p.area * pv * 0.40 * (ctrl.freshPct / 100) * slFact * uf;
        if (k === 'opt3')     return baseExist;
        if (k === 'opt4')     return baseExist * (1 + ctrl.wpiRate / 100);
        if (k === 'opt5')     return baseExist * 1.5;
        if (k === 'opt6')     return baseExist * (1 + ctrl.blockPct / 100);
        return baseExist;
      }

      const rents = {};
      SCEN_KEYS.forEach(function(k) { rents[k] = firmRent(k) * effReclF; });

      const resA = invA * (ctrl.residualPct / 100);
      const resR = invR * (ctrl.residualPct / 100);
      const irrs = {};
      SCEN_KEYS.forEach(function(k) {
        const yr1  = rents[k];
        const cfsA = buildCFs(invA, yr1, g, ctrl.irrHorizon, resA, expiry, baseExist);
        const cfsR = buildCFs(invR, yr1, g, ctrl.irrHorizon, resR, expiry, baseExist);
        irrs[k] = { actual: cfsA ? calcIRR(cfsA) : null, rev: cfsR ? calcIRR(cfsR) : null };
      });

      return { p: Object.assign({}, p, {status, expiry, yearsLeft}), pv, acqPsqm, existing, rents, irrs, isRec, effReclF };
    });
  }, [plots, ctrl]);

  // ── REVENUE BIFURCATION ──────────────────────────────────────────
  const bifurc = useMemo(function() {
    const types = ['sopc','lpa','reclaimed_pre2018','reclaimed_post2018'];
    const result = {};
    types.forEach(function(t) {
      const rows = computed.filter(function(r) { return r.p.landType === t; });
      const totE = rows.reduce(function(s,r) { return s + r.existing; }, 0);
      const entry = { existing: totE, count: rows.length };
      SCEN_KEYS.forEach(function(k) { entry[k] = rows.reduce(function(s,r) { return s + r.rents[k]; }, 0); });
      result[t] = entry;
    });
    const totE2 = computed.reduce(function(s,r) { return s + r.existing; }, 0);
    const tot = { existing: totE2, count: computed.length };
    SCEN_KEYS.forEach(function(k) { tot[k] = computed.reduce(function(s,r) { return s + r.rents[k]; }, 0); });
    result.total = tot;
    return result;
  }, [computed]);

  // ── FILTER + SORT ────────────────────────────────────────────────
  const filtered = useMemo(function() {
    let arr = computed;
    if (filt.land !== 'All')    arr = arr.filter(function(r) { return r.p.landType === filt.land; });
    if (filt.port !== 'All')    arr = arr.filter(function(r) { return r.p.port === filt.port; });
    if (filt.status !== 'All')  arr = arr.filter(function(r) { return r.p.status === filt.status; });
    if (filt.impact === 'Higher') arr = arr.filter(function(r) { return r.rents.opt6 > r.existing + 1; });
    if (filt.impact === 'Lower')  arr = arr.filter(function(r) { return r.rents.opt6 < r.existing - 1; });
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(function(r) { return r.p.name.toLowerCase().includes(q) || r.p.port.toLowerCase().includes(q); });
    }
    if (sortK === 'impact')   arr = arr.slice().sort(function(a,b) { return Math.abs(b.rents.opt6-b.existing) - Math.abs(a.rents.opt6-a.existing); });
    else if (sortK === 'area')     arr = arr.slice().sort(function(a,b) { return b.p.area - a.p.area; });
    else if (sortK === 'existing') arr = arr.slice().sort(function(a,b) { return b.existing - a.existing; });
    else if (sortK === 'expiry')   arr = arr.slice().sort(function(a,b) { return a.p.yearsLeft - b.p.yearsLeft; });
    return arr;
  }, [computed, filt, search, sortK]);

  const paged    = filtered.slice(pg * PGS, (pg + 1) * PGS);
  const totalPg  = Math.ceil(filtered.length / PGS);

  // ── CRUD ─────────────────────────────────────────────────────────
  const savePlot = useCallback(function(p) {
    if (isNew) setPlots(function(ps) { return ps.concat([Object.assign({},p,{id:_id++})]); });
    else       setPlots(function(ps) { return ps.map(function(x) { return x.id === p.id ? p : x; }); });
    setEditP(null); setIsNew(false);
  }, [isNew]);

  const delPlot = useCallback(function(id) {
    setPlots(function(ps) { return ps.filter(function(x) { return x.id !== id; }); });
    setEditP(null); setIsNew(false);
  }, []);

  function openAdd() {
    setIsNew(true);
    setEditP({id:-1,name:'',port:'Veraval',portIdx:10,pgIdx:3,landType:'sopc',area:500,currentRent:5090,leaseStart:2022,leaseTerm:5,acqCr:0,indivVal:null,acqValPsqm:null,recYear:null,notes:''});
  }

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div style={{background:'#f8fafc',minHeight:'100vh',fontFamily:'system-ui,sans-serif'}}>

      {/* HEADER */}
      <div style={{background:'#1e3a8a',padding:'8px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <p style={{color:'#fff',fontSize:13,fontWeight:700,margin:0}}>GMB Land Policy — Revenue Impact Dashboard</p>
          <p style={{color:'#93c5fd',fontSize:10,margin:'2px 0 0'}}>{plots.length} plots · 4 land categories · 8 scenarios · Live IRR</p>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button onClick={function(){setCpOpen(function(o){return !o;});}} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.3)',fontWeight:400}}>
            {cpOpen ? 'Hide Panel' : 'Show Panel'}
          </button>
          <button onClick={openAdd} style={{fontSize:10,padding:'4px 10px',borderRadius:4,cursor:'pointer',background:'#22c55e',color:'#fff',border:'none',fontWeight:600}}>
            + Add Plot
          </button>
        </div>
      </div>

      <div style={{display:'flex',gap:10,padding:'10px 12px',alignItems:'flex-start'}}>

        {/* CONTROL PANEL */}
        {cpOpen && (
          <div style={{width:260,flexShrink:0}}>
            <ControlPanel c={ctrl} setC={setCtrl}/>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div style={{flex:1,minWidth:0}}>

          {/* REVENUE BIFURCATION */}
          <div style={{background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,padding:'0.75rem',marginBottom:8}}>
            <p style={{fontSize:11,fontWeight:700,margin:'0 0 8px',color:'#374151'}}>📊 Annual Revenue — All Land Types × All Scenarios (₹ Crore)</p>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
                <thead>
                  <tr>
                    <th style={Object.assign({},TH,{minWidth:110})}>Land Type</th>
                    <th style={Object.assign({},TH,{minWidth:36,textAlign:'right'})}>Plots</th>
                    <th style={Object.assign({},TH,{minWidth:70,textAlign:'right',background:'#dbeafe',color:'#1e40af'})}>Existing ₹</th>
                    {SCEN_KEYS.map(function(k) {
                      return <th key={k} style={Object.assign({},TH,{minWidth:60,textAlign:'right',background:SCEN_META[k].bg,color:SCEN_META[k].color})}>{SCEN_META[k].short}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {['sopc','lpa','reclaimed_pre2018','reclaimed_post2018','total'].map(function(t,ti) {
                    const d = bifurc[t];
                    if (!d) return null;
                    const isTotal = t === 'total';
                    const rowBg = isTotal ? '#f0f9ff' : ti % 2 === 0 ? '#fafafa' : '#fff';
                    const tm = TYPE_META[t];
                    return (
                      <tr key={t} style={{background:rowBg,fontWeight:isTotal?700:400}}>
                        <td style={Object.assign({},TD,{fontWeight:isTotal?700:500})}>
                          {tm ? <span style={badgeStyle(tm.color,tm.bg)}>{TYPE_LABELS[t]}</span> : <strong>{TYPE_LABELS[t]}</strong>}
                        </td>
                        <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af'})}>{d.count}</td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',background:'#eff6ff',fontWeight:isTotal?700:500})}>{fmtCr(d.existing)}</td>
                        {SCEN_KEYS.map(function(k) {
                          const diff = d[k] - d.existing;
                          const isPos = diff >= 0;
                          return (
                            <td key={k} style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',background:SCEN_META[k].bg+'44'})}>
                              <div>{fmtCr(d[k])}</div>
                              {!isTotal && <div style={{fontSize:8,color:isPos?'#065f46':'#991b1b'}}>{fmtChg(d[k],d.existing)}</div>}
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

          {/* FILTER BAR */}
          <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap',alignItems:'center',background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,padding:'6px 10px'}}>
            <input type="text" placeholder="🔍 Search lessee or port…" value={search}
              onChange={function(e){setSearch(e.target.value);setPg(0);}}
              style={Object.assign({},INP,{width:170})}/>
            <select style={SEL} value={filt.land} onChange={function(e){setFilt(function(f){return Object.assign({},f,{land:e.target.value});});setPg(0);}}>
              <option value="All">All types</option>
              <option value="sopc">SoPC</option><option value="lpa">LPA</option>
              <option value="reclaimed_pre2018">Rec&lt;2018</option><option value="reclaimed_post2018">Rec≥2018</option>
            </select>
            <select style={SEL} value={filt.port} onChange={function(e){setFilt(function(f){return Object.assign({},f,{port:e.target.value});});setPg(0);}}>
              <option value="All">All ports</option>
              {PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}
            </select>
            <select style={SEL} value={filt.status} onChange={function(e){setFilt(function(f){return Object.assign({},f,{status:e.target.value});});setPg(0);}}>
              <option value="All">All status</option><option value="active">Active</option>
              <option value="expiring">Expiring</option><option value="expired">Expired</option>
            </select>
            <select style={SEL} value={filt.impact} onChange={function(e){setFilt(function(f){return Object.assign({},f,{impact:e.target.value});});setPg(0);}}>
              <option value="All">All impacts</option><option value="Higher">↑ Higher rent</option><option value="Lower">↓ Lower rent</option>
            </select>
            <select style={SEL} value={sortK} onChange={function(e){setSortK(e.target.value);}}>
              <option value="impact">Sort: Impact</option><option value="area">Sort: Area</option>
              <option value="existing">Sort: Existing Rent</option><option value="expiry">Sort: Expiry</option>
            </select>
            <span style={{fontSize:10,color:'#9ca3af',marginLeft:'auto'}}>{filtered.length} plots &nbsp;·&nbsp; Click row for full detail</span>
          </div>

          {/* COMPARISON MATRIX */}
          <div style={{background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
                <thead>
                  <tr style={{background:'#f1f5f9'}}>
                    <th style={Object.assign({},TH,{minWidth:28,position:'sticky',left:0,zIndex:2})}>#</th>
                    <th style={Object.assign({},TH,{minWidth:145,position:'sticky',left:28,zIndex:2})}>Lessee / Plot</th>
                    <th style={Object.assign({},TH,{minWidth:60,position:'sticky',left:173,zIndex:2})}>Port</th>
                    <th style={Object.assign({},TH,{minWidth:56})}>Type</th>
                    <th style={Object.assign({},TH,{minWidth:72,textAlign:'right'})}>Area</th>
                    <th style={Object.assign({},TH,{minWidth:50,textAlign:'right'})}>Expiry</th>
                    <th style={Object.assign({},TH,{minWidth:52})}>Status</th>
                    <th style={Object.assign({},TH,{minWidth:72,textAlign:'right',background:'#dbeafe',color:'#1e40af',borderLeft:'2px solid #93c5fd'})}>Existing ₹</th>
                    {SCEN_KEYS.map(function(k) {
                      return (
                        <th key={k} colSpan={2} style={Object.assign({},TH,{minWidth:120,textAlign:'center',background:SCEN_META[k].bg,color:SCEN_META[k].color,borderLeft:'0.5px solid #e5e7eb'})}>
                          {SCEN_META[k].short}
                        </th>
                      );
                    })}
                  </tr>
                  <tr style={{background:'#f8fafc'}}>
                    <th style={Object.assign({},TH,{position:'sticky',left:0,zIndex:2})}/>
                    <th style={Object.assign({},TH,{position:'sticky',left:28,zIndex:2})}/>
                    <th style={Object.assign({},TH,{position:'sticky',left:173,zIndex:2})}/>
                    <th style={TH}/><th style={TH}/><th style={TH}/><th style={TH}/>
                    <th style={Object.assign({},TH,{background:'#eff6ff',borderLeft:'2px solid #93c5fd'})}/>
                    {SCEN_KEYS.map(function(k) {
                      return (
                        <Fragment key={k}>
                          <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',borderLeft:'0.5px solid #e5e7eb',fontSize:9,minWidth:60})}>Rent</th>
                          <th style={Object.assign({},TH,{textAlign:'right',background:SCEN_META[k].bg+'55',fontSize:9,minWidth:54})}>% Chg</th>
                        </Fragment>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paged.map(function(row, ri) {
                    const p       = row.p;
                    const existing= row.existing;
                    const rents   = row.rents;
                    const tm      = TYPE_META[p.landType] || TYPE_META.sopc;
                    const sm      = STATUS_META[p.status] || STATUS_META.active;
                    const rowBg   = ri % 2 === 0 ? '#fff' : '#fafafa';
                    return (
                      <tr key={p.id}
                        style={{background:rowBg, cursor:'pointer'}}
                        onClick={function(){setDetail(row);}}
                        onMouseEnter={function(e){e.currentTarget.style.background='#f0f9ff';}}
                        onMouseLeave={function(e){e.currentTarget.style.background=rowBg;}}
                      >
                        <td style={Object.assign({},TD,{textAlign:'right',color:'#9ca3af',position:'sticky',left:0,background:rowBg})}>{pg*PGS+ri+1}</td>
                        <td style={Object.assign({},TD,{maxWidth:145,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',position:'sticky',left:28,background:rowBg,fontWeight:p.landType!=='sopc'?600:400})} title={p.name}>
                          <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                          {p.acqCr > 0 && <div style={{fontSize:8,color:'#9ca3af'}}>Acq ₹{p.acqCr}Cr</div>}
                        </td>
                        <td style={Object.assign({},TD,{color:'#6b7280',position:'sticky',left:173,background:rowBg})}>{p.port}</td>
                        <td style={TD}><span style={badgeStyle(tm.color,tm.bg)}>{tm.label}</span></td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{fmtA(p.area)}</td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace'})}>{p.expiry}</td>
                        <td style={TD}><span style={badgeStyle(sm.color,sm.bg)}>{sm.label}</span></td>
                        <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',fontWeight:700,background:'#eff6ff',borderLeft:'2px solid #93c5fd',color:'#1e40af'})}>{fmtCr(existing)}</td>
                        {SCEN_KEYS.map(function(k) {
                          const r    = rents[k];
                          const diff = r - existing;
                          const isPos= diff >= 0;
                          return (
                            <Fragment key={k}>
                              <td style={Object.assign({},TD,{textAlign:'right',fontFamily:'monospace',borderLeft:'0.5px solid #f0f0f0',background:SCEN_META[k].bg+'22'})}>{fmtCr(r)}</td>
                              <td style={Object.assign({},TD,{textAlign:'right',fontWeight:700,background:SCEN_META[k].bg+'22',color:isPos?'#065f46':'#991b1b'})}>{fmtChg(r,existing)}</td>
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

          {/* PAGINATION */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,padding:'0 2px'}}>
            <span style={{fontSize:10,color:'#6b7280'}}>Page {pg+1} of {totalPg} &nbsp;·&nbsp; {filtered.length} plots</span>
            <div style={{display:'flex',gap:3}}>
              <button disabled={pg===0} onClick={function(){setPg(function(p){return p-1;});}} style={Object.assign({},btnStyle(false),{opacity:pg===0?0.3:1})}>← Prev</button>
              {Array.from({length:Math.min(totalPg,7)},function(_,i){return i + Math.max(0,pg-3);}).filter(function(i){return i<totalPg;}).map(function(i){
                return <button key={i} onClick={function(){setPg(i);}} style={btnStyle(i===pg,'#1e40af')}>{i+1}</button>;
              })}
              <button disabled={pg>=totalPg-1} onClick={function(){setPg(function(p){return p+1;});}} style={Object.assign({},btnStyle(false),{opacity:pg>=totalPg-1?0.3:1})}>Next →</button>
            </div>
            <span style={{fontSize:10,color:'#9ca3af'}}>Click any row → full IRR detail</span>
          </div>

          {/* LEGEND */}
          <div style={{background:'#f0f9ff',border:'0.5px solid #bfdbfe',borderRadius:6,padding:'8px 12px',marginTop:8,fontSize:10,color:'#1e40af',lineHeight:1.7}}>
            <strong>How to read:</strong> Blue column = current contractual rent (Existing). Each scenario shows proposed rent + % change. <span style={{color:'#065f46',fontWeight:600}}>Green</span> = rent goes up (GMB earns more). <span style={{color:'#991b1b',fontWeight:600}}>Red</span> = rent goes down or lessee gets relief. Click any row to see ₹ absolute change, times multiplier, IRR(Actual) and IRR(Revalued) for all 8 scenarios. Opt 6 ✓ = recommended policy.
          </div>
        </div>
      </div>

      {/* MODALS */}
      {editP && (
        <PlotEditor
          plot={editP}
          onSave={savePlot}
          onDelete={delPlot}
          onClose={function(){setEditP(null);setIsNew(false);}}
          isNew={isNew}
        />
      )}
      {detail && (
        <RowDetail
          row={detail}
          onClose={function(){setDetail(null);}}
          onEdit={function(){setEditP(detail.p);setDetail(null);}}
        />
      )}
    </div>
  );
}
