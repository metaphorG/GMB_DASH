import { useState, useMemo, useCallback, Fragment, useEffect, useRef } from "react";

// ═══════════════════════════════════════ JSONBIN CONFIG ══════════════════════
const JSONBIN_ID  = '6a0367b8250b1311c33de7a7';
const JSONBIN_KEY = '$2a$10$F1LfGWg51BWexG/3aptWR.9LiWTSjKP5ozoASlZydrByLgYsa5wSy';
const BIN_URL     = 'https://api.jsonbin.io/v3/b/' + JSONBIN_ID;
const HDR_READ    = { 'X-Master-Key': JSONBIN_KEY, 'X-Bin-Meta': 'false' };
const HDR_WRITE   = { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_KEY };
const CONFIGURED  = JSONBIN_ID !== 'YOUR_BIN_ID_HERE' && JSONBIN_KEY !== 'YOUR_MASTER_KEY_HERE';

// ═══════════════════════════════════════ CONSTANTS ═══════════════════════════
const CY = 2025;
const PORT_NAMES = ['Alang','Bhavnagar','Jafrabad','Jamnagar','Magdalla','Mandvi','Mangrol','Navlakhi','Okha','Porbandar','Veraval','Dahej','Hazira','Mundra'];
const PG_IDX = {'Magdalla':0,'Dahej':0,'Hazira':0,'Bhavnagar':1,'Alang':1,'Navlakhi':1,'Jamnagar':2,'Okha':2,'Mundra':2,'Mandvi':2,'Veraval':3,'Porbandar':3,'Mangrol':3,'Jafrabad':3};
const PG_NAMES = ['South Gujarat Coast','Saurashtra East','Saurashtra West','South Saurashtra'];

// RAW format:
//   SoPC [0]: [area, portIdx, 0, name, leaseStart, leaseEnd]
//   LPA  [1]: [area, portIdx, 1, name, leaseStart, leaseEnd, acqCr, BASE_rent_at_allotment]
//   Recl [2]: [area, portIdx, 2, name, leaseStart, leaseEnd, acqCr, baseRent]
const RAW = [
[800.0,0,0,"M/s S.&S. Brothers Ahmedabad.",1983,1993],
[800.0,0,0,"M/S Ushmaniya Oxygen Pvt. Ltd. Bombay.",1983,1993],
[600.0,0,0,"M/s Capital Oxygen Co. New Delhi.",2015,2025],
[600.0,0,0,"M/s Supirior Air Product Ltd, New Delhi.",1985,1995],
[800.0,0,0,"M/s Aims Oxygen Pvt, Ltd, Baroda.",1983,1993],
[600.0,0,0,"M/s Sharma & Co. Bombay.",1986,1996],
[425.0,0,0,"Indian Red Cross Society.",1983,2013],
[800.0,0,0,"SBS, Bhavnagar",1984,2014],
[875.0,0,0,"M/s Shirdi Steel Traders. Bhavnagar.",1995,2010],
[875.0,0,0,"M/s Gupta Steel, Bhavnagar.",1995,2010],
[240.0,0,0,"Dr.M. Amin A. Hamidani. Bhavnagar.",1997,2016],
[600.0,0,0,"M/s Hindustan Gas & Indu. Ltd.",1986,1996],
[600.0,0,0,"M/s Peckok Chemicals Pvt.Ltd",1987,1997],
[800.0,0,0,"Shri B M Shah & Sons Bhavnagar",1983,1993],
[300.0,0,0,"Shri Pravin Vaja",1986,1996],
[304.0,0,0,"Bharat Sanchar Nigam Ltd (BSNL), Alang",2008,2013],
[441.0,0,0,"M/s Bombay weigh bridge, Bhavnagar.",2005,2010],
[964.5,0,0,"Shri Manoharsinh Jagatsinh Chauhan.",2014,2014],
[3375.0,0,0,"M/s Gujarat Gas Ltd",2015,2025],
[590.0,1,0,"Shri Chimanlal. N. Patel Bhavnagar.",1975,1995],
[416.577,1,0,"Shri Keshavlal H Patel & Co.Bhavnagar.",1975,1994],
[744.0,1,0,"Shri Nagindas N Pate Bhavnagar.",1975,1990],
[919.37,1,0,"M/s J J Patel Gas Agency, Bhavnagar.",1983,1993],
[75000.0,1,0,"M/s Bhavnagar Vegitable Products Ltd, Bhavnagar.",1986,1986],
[919.46,1,0,"M/s H P Vitthalpara. Bhavnagar.",1984,1994],
[899.395,1,0,"M/s B K Mansatar. Bhavnagar.",1985,1995],
[836.431,1,0,"M/s H k kamdar & Sons. Bhavnagar.",2015,2025],
[100.0,1,0,"M/s Union Fair scale",1983,2013],
[3442.5,1,0,"M/s Mars Metal Oxides & Alloys Corporation Bhavnagar.",1994,1999],
[928.0,1,0,"M/s Namrta Gas Agency Bhavnagar.",1994,1999],
[250.61,1,0,"M/s J M Baxi & Co. Bombay.",1994,2009],
[791.0,1,0,"M/s. Jirawala Plastic, Bhavnagar",2014,2038],
[900.0,1,0,"M/s Bharat Petroium Corporation Ltd.",1995,2005],
[196.0,1,0,"M/s Dhandin Weigh Bridge Bhavnagar.",1996,2030],
[1400.0,1,0,"M/s Sea Land Shipping & Export Pvt, Ltd.",1996,2001],
[928.0,1,0,"Shri Dilipsinh Ajitsinh Gohil",1996,2001],
[960.0,1,0,"Smt.Ushaben R Agrawal",1991,2001],
[2500.0,1,0,"M/s. Laxmi Toughen Glass, Bhavnagar",2015,2020],
[900.0,1,0,"Smt.Daxaben Dharmeshbhai Manadalia",2013,2027],
[800.0,1,0,"M/s. Shrenik Sales Corporation, Bhavnagar",2014,2038],
[2500.0,1,0,"M/s Bhavna Marine Engineers.Bhvngar.",2001,2025],
[1044.0,1,0,"Shri Nileshkumar H Patel",2002,2006],
[750.0,1,0,"Shri Jitendra Manubhai Vyas. Bhavnagar.",2002,2007],
[215.8,1,0,"Shri Abdul Razaq Amadbhai, Bhavnagar",1990,1995],
[1800.0,1,0,"Shri Mayurdhvajsinh Ghohil, Bhavnagar",1990,2049],
[682.837,1,0,"Shri Kiritkumar Harilal Patel",1990,1995],
[400.0,1,0,"Saurashtra Petroliums Ltd",1990,1995],
[800.0,1,0,"M/s. Param Plastic Industries, Bhavnagar",2014,2019],
[1000.0,1,0,"The District Superintendent of Police.Bhavnagar.",2008,2008],
[9058.0,1,0,"M/s J.K.Steel & Alloys, Bhavnagar",1971,2001],
[1134.0,1,0,"M/s. Sea services Pvt. Ltd. Ahmedabad",1995,1996],
[900.0,1,0,"M/s. Heena Gases, Bhavnagar",2015,2020],
[1000.0,1,0,"Smt.Khamaba Dilaversingh Gohil, Bhavnagar",2017,2026],
[222.705,1,0,"Shri Vishalpara Unnit Girishkumar, Bhavnagar",2014,2019],
[155.04,1,0,"Shri Vishalpara Unnit Girishkumar, Bhavnagar",2014,2019],
[547.2,1,0,"Shri Nitinbhai Vallabhbhai Loriya, Bhavnagar",2014,2019],
[1800.0,1,0,"Shri Kirit Jayantilal Bhatt, Bhavnagar",2013,2018],
[4.0,1,0,"M/s. Reliance Jio Infocomm Limited, Ahmedabad",2015,2019],
[9.0,1,0,"M/s. Reliance Jio Infocomm Limited, Ahmedabad",2019,2024],
[2100.0,1,0,"Mrs.Pravasini Rajeshbhai Joshi",2015,2025],
[1800.0,1,0,"Mr. Dhirajkumar Gyanchand Rajai",2015,2025],
[700.0,1,0,"M/s. Shrenik Sales Corporation, Bhavnagar",2015,2025],
[1250.0,1,0,"M/s. Patanjali Marine",2015,2025],
[10000.0,1,0,"M/s. Mahek Agro Mineral Pvt. Ltd.",2015,2025],
[1250.0,1,0,"M/s. Maya Marine & Logistics",2015,2025],
[450.0,2,0,"M/s Jafrabad Matsyodhyog Seva Sahkari Mandali",1994,2004],
[137.0,2,0,"Police-sub-Inspector. Jafrabad.",2002,2012],
[7161.0,3,0,"Gujarat Ware housing Co. Jamnagar.",1983,2023],
[600.0,3,0,"M/s N.K. Parmar. Jamnagar.",1991,2025],
[29071.0,3,0,"M/s Shakti Clearing Agency pvt, ltd. Jamnagar.",1999,2014],
[55.35,3,0,"Director of Light Houses & lightships. Jamnagar.",1986,2001],
[750.0,3,0,"Shri salaya Machhimar Sahkari Mandali Ltd. Jamnagar.",1982,1991],
[10156.0,3,0,"M/s Integreted Proteins ltd. Jamnagar.",1994,1999],
[23717.5,3,0,"M/s Reliance Petroleum Ltd. Jamnagar.",1998,2027],
[1103.6,3,0,"M/s Veer Dock co.Pvt. Ltd. Jamnagar.",1992,1997],
[464.51,3,0,"Shri Jamnagar Panjrapol. Jamnagar.",1977,1997],
[1524.0,3,0,"Shri Ajij.J. Charaniya. Jamnagar.",2015,2025],
[227113.0,3,0,"M/s Digvijay Cement & Co, Ltd. Sikka.",1997,2007],
[7800.0,3,0,"The Fisheries Department Govt. of Gujarat.",2015,2025],
[560.0,3,0,"Shri Jamnagar Panjrapol. Jamnagar.",1991,2001],
[1063.21,3,0,"M/S Costum House Agent Association Jamnagar",2003,2003],
[3600.0,3,0,"M/s Shakti Clearing agency pvt, ltd Jamnagar.",1998,2003],
[25.0,3,0,"M/s. Reliance Jio Infocomm Limited (RJIL) Mumbai",2019,2028],
[25.0,3,0,"M/s. Reliance Jio Infocomm Limited (RJIL) Mumbai",2019,2028],
[25.0,3,0,"M/s. Reliance Jio Infocomm Limited (RJIL) Mumbai",2019,2028],
[600.0,3,0,"M/s. Shreeji Shipping, Jamnagar",2019,2023],
[500.0,3,0,"M/s. Shreeji Shipping, Jamnagar",2021,2025],
[500.0,3,0,"M/s.Vasuki Tradelink Pvt. Ltd, Rajkot",2021,2025],
[22360.0,4,0,"M/s Narmada Cement Co Ltd, Magdalla",1978,2008],
[210.0,4,0,"M/s Gayatri weighbridge, Magdalla.",1990,2020],
[1700.0,4,0,"M/s Ashwani Shipping Corporation. Surat.",1997,2012],
[300.0,4,0,"Gujarat Fisheries Central Co, Op,Ltd, Ahmedabad",1992,2021],
[300.0,4,0,"Gujarat Fisheries Central Co, Op,Ltd, Ahmedabad",1992,2021],
[1114.0,5,0,"M/s Hindustan Petroleum, Mandvi",1982,2026],
[350.0,5,0,"Shri Nurmamad H Sangani. MotaSalaya, Mandvi.",2000,2010],
[660.0,5,0,"M/s Gujarat Fisheries. C.C.A Ltd; Ahmedabad.",2001,2011],
[1225.0,5,0,"M/s Zarpara Matsyodhyog Seva Sahkari Mandali Ltd.",1997,2002],
[165.0,5,0,"M/s Sara Engineering Works, Mandvi",2008,2013],
[38.2,5,0,"BSNL, Bharat Sanchar Nigam Ltd. Gandhidham.",2007,2017],
[1000.0,5,0,"Adani Port Ltd., Ahmedabad",1994,1999],
[353.6,5,0,"M/s Mandvi Salaya Matsyodhyog Seva Sahakari Mandli",2014,2025],
[1700.0,7,0,"M/s Shivm Marine Services, Navlakhi",1996,2035],
[4740.0,7,0,"M/s Chaugule & Co;Ltd; Dhrol",2002,2026],
[450.0,7,0,"M/s Gayatri Weigh bridge. Navlakhi",2011,2035],
[220.0,7,0,"General Manager Bharat Sanchar Nagam Ltd. Rajkot.",2009,2014],
[300.0,7,0,"The District Superintendent of Police Rajkot Rural",2009,2009],
[233.0,7,0,"M/s Indus Tower Ahmedabad",2017,2021],
[400.0,8,0,"M/s Pavanputra Fish Co-Op, Society Ltd, Porbander",1999,2018],
[300.0,8,0,"M/s Pavanputra Fish Co-Op, Society Ltd, Porbander",2002,2016],
[750.0,8,0,"M/s Adarsh Fish Seva Co-Op; Society Ltd, Okha.",2002,2025],
[750.0,8,0,"M/s Adarsh Fish Seva Co-Op Society, Okha",1993,2025],
[12270.0,8,0,"Comm of Fisheries / Research Officer GKU, Okha",1961,1961],
[660.0,8,0,"State Bank Of India Okha",1985,2024],
[200.0,8,0,"Police Station. Okha",2006,2006],
[900.0,8,0,"The District Superintendent of Police, Jamnagar. Marine Police",2007,2007],
[1032.0,8,0,"M/s. Indian Roadlines, Jamnagar",2015,2019],
[256.0,9,0,"Shri Sagar Sarvodaya Co-Op society, Porbandar",1978,2017],
[660.0,9,0,"Smt.Premilaben N. Lodhari. Porbandar",1991,2020],
[300.0,9,0,"M/s Associated Transport Co. Porbandar",1991,2001],
[256.0,9,0,"M/s JaySagar Fishing Co-Op, Society, Porbandar",1991,2025],
[434.0,9,0,"M/s RatnaSagar Ice Factory Porbandar.",1990,2015],
[35.55,9,0,"Smt Nilamben K. kotiya. Porbandar",1992,2021],
[2460.0,9,0,"Agro Marine / Gujarat Fisheries, Porbandar",1973,2052],
[459.02,9,0,"Shri SagarSakti Fishing co-Op Society, Porbandar",2000,2005],
[315.0,9,0,"Shri Hiren Enterpricies. Porbandar",2000,2014],
[1352.81,9,0,"Shri Mustaq Haji Siddik. Palkhiwala. Porbandar",2000,2014],
[428.41,9,0,"M/s Deep Ice Industries. Porbandar.",1994,2014],
[370.0,9,0,"Shri Arjan Hira Lodhari Porbandar.",1995,2019],
[464.0,9,0,"Shri Premji Kanji Lodhari Porbandar.",1995,2024],
[468.0,9,0,"Shri Jivan Padhu Masani Porbandar.",1995,2024],
[346.0,9,0,"Shri Narsi Kanji Jungi. Porbandar",1995,2024],
[601.18,9,0,"Shri Rajmilan Transport, Porbandar",1995,2019],
[1250.0,9,0,"Shri Chum Ice & Cold Storage Porbandar",1995,2015],
[120.4,9,0,"M/s SHVNG LPG Infastucture Pvt,Ltd. Pbr.",1995,2020],
[371.58,9,0,"Shri Dhansukh Velji Lodhari. Porbandar.",1996,2025],
[320.0,9,0,"Shri Pavanputra Fisheries Co-Op Society ltd; Porbandar.",1996,2025],
[900.0,9,0,"Shri Jaysagar Fisheries Co-Op Society Ltd; Porbandar.",1001,2025],
[468.0,9,0,"M/s Ganesh Ice Factory Porbandar.",1996,2025],
[798.0,9,0,"Shri Narsi Velji Lodhari (Star Ice Factory) Porbandar",1996,2020],
[862.8,9,0,"Shri Kanji Ramji Salet Porbandar.",2000,2024],
[748.0,9,0,"Shri Bhikhu Velji Lodhari. Porbandar.",1997,2002],
[360.0,9,0,"Shri Kishore Ratanshi Lodhari. Porbandar",2000,2005],
[519.2,9,0,"Shri Bhimji Padhu Toraniya. Porbandar.",1999,2013],
[584.85,9,0,"Shri Vivek Matsyodhog Co.Op.Ltd. Porbandar.",2000,2029],
[484.0,9,0,"Shri Hiralal Babu Masani. Porbandar.",2000,2024],
[225.0,9,0,"Shri Paresh Narsi Jungi. Porbandar",2000,2024],
[240.0,9,0,"Smt. Savitaben Narsi Jungi. Porbandar.",2000,2024],
[2161.54,9,0,"Shri Chum Fresh Fish. Porbandar.",2000,2014],
[930.0,9,0,"Smt. Jayaben Premjibhai Lodhari. Porbandar.",2000,2010],
[350.0,9,0,"Shri Faruq Haji Sidik Palkhivala. Porbandar.",2000,2014],
[286.0,9,0,"Shri Narsi Babubhai Masani. Porbandar.",2001,2025],
[135.0,9,0,"Shri Narsi B Masani. Porbandar.",2001,2025],
[400.0,9,0,"Shri Rajdhani Fisheries Co.Op.Ltd. Porbandar.",2001,2006],
[2100.0,9,0,"Shri Amar Fish Pilling Shed. Porbandar",2001,2015],
[632.0,9,0,"Shri Naran Mepa Lodhari. Porbandar.",2001,2025],
[300.0,9,0,"Shri Vinod Premji Kotiya. Porbandar.",2001,2011],
[227.0,9,0,"Shri Madhavji Bhimji Motivaras. Porbandar.",2001,2025],
[600.0,9,0,"Shri Ruhi Frozen Foods. Porbandar.",2001,2025],
[1560.0,9,0,"Shri Rajesh Babulal Panjri, Porbandar",2001,2025],
[1400.0,9,0,"Shri N K Jungi. Porbandar.",2002,2021],
[850.0,9,0,"Shri Dhansukh Velji Lodhari. Porbandar.",2001,2025],
[251.2,9,0,"Shri Dinesh Ramji Postariya. Porbandar.",2002,2021],
[846.0,9,0,"Shri Babulal Jadavji Khokhri",2002,2026],
[1710.0,9,0,"Shri Kantilal Velji Jungi. Porbandar.",2002,2022],
[798.0,9,0,"Shri karsan Ramji Salet. Porbandar.",2002,2026],
[480.0,9,0,"Shri Velji Kanji Kotiya. Porbandar.",2002,2011],
[175.0,9,0,"Shri Rajesh Naran Lodhari Porbandar",2002,2026],
[600.0,9,0,"Shri Velji Madhavji Salet. Porbandar.",2002,2026],
[2593.5,9,0,"Shri Saurastra Cement Ltd. Ranavav. Porbandar.",2002,2007],
[1371.75,9,0,"Shri Sunil Devshi Gohil",2003,2027],
[231.25,9,0,"Shri Hiralal Padhu Jungi",1995,2000],
[1595.62,9,0,"Porbandar Nagarpalika Fish Market",2002,2002],
[900.0,9,0,"Porbandar Nagarpalika",2015,2025],
[3000.0,9,0,"Smt. Sobhnaben Kantilal Jungi. Porbandar",2008,2022],
[500.0,9,0,"The District Superintendent of Police. Porbandar.",2015,2008],
[5761.5,9,0,"Indian Navy, Porbandar.",2015,2025],
[1389.53,9,0,"M/s Jadavbhai Varjangbhai Chudasama, Porbandar",2011,2025],
[1240.31,9,0,"Shri Chhagan Gokal Lodhari, Porbandar",2011,2016],
[2988.29,9,0,"M/s. Amrut Cold Storage Pvt.Ltd.",2015,2019],
[80.0,9,0,"Shri Siddik Jamal Sati. Porbandar",2015,2024],
[1500.29,9,0,"Shri Mohan Hiralal Siyal, Porbandar",2016,2020],
[725.0,9,0,"The District Superintendent of Police. Porbandar.",2014,2014],
[2228.11,9,0,"Shri Ramesh P Motivaras, Porbandar",2012,2026],
[1084.97,9,0,"Shri Mohanlal Premjibhai Motivaras, Porbandar",2012,2026],
[979.37,9,0,"Smt. Jayaben Premjibhai Lodhari. Porbandar.",1997,2026],
[600.0,9,0,"Shri Pravinbhai Babubhai Masani, Porbandar",2015,2019],
[620.5,9,0,"Shri Babubhai Jadavji KhoKhri, Porbandar",2012,2026],
[240.0,9,0,"Shri Babubhai Bhikhubhai KhoKhari, Porbandar",2016,2025],
[2198.18,9,0,"Shri Harish Ramji Postaiya, Porbandar",2015,2019],
[330.0,9,0,"Shri Harjivan Khimaji Kotiya, Porbandar",2014,2023],
[864.58,9,0,"Shri Mohamedsiddiq Gulamhusain Karatela, Porbandar",2014,2023],
[504.0,9,0,"Shri Hirabhai Narshibhai Khetalpal, Mangrol",2013,2022],
[1138.76,9,0,"M/s. West Coast Foods, Porbandar",2012,2026],
[600.0,9,0,"Shri Harsh Sagar Matsyodhyog Seva Sahakari Mandli Ltd., Porbandar",2013,2027],
[535.6,9,0,"Smt.Kantaben Devjibhai Kotiya, Porbandar",2013,2027],
[383.84,9,0,"Shri Dhansukh Khimabhai Badarsahi, Porbandar",2015,2019],
[600.0,9,0,"M/s Shivangi Fisheries Co-Op Society, Porbandar",2015,2019],
[1260.0,9,0,"Shri Nitesh Arjunbhai Jungi, Porbandar",2015,2019],
[890.0,9,0,"Smt. Bhartiben Rameshbhai Gohel, Porbandar",2015,2019],
[350.0,9,0,"Shri Pravinbhai Babubhai Masani, Porbandar",2022,2022],
[25.0,9,0,"Reliance Jio Infocomm Limited (RJIL), Mumbai",2023,2023],
[25.0,9,0,"Reliance Jio Infocomm Limited (RJIL), Mumbai",2023,2023],
[25.0,9,0,"Reliance Jio Infocomm Limited (RJIL), Mumbai",2023,2023],
[4360.0,9,0,"M/s. Honest Dry Fish",2023,2023],
[305.89,9,0,"Shri Kamleshbhai Babulal Gohel",2024,2024],
[733.54,9,0,"Shri Nathalal Jungi",2024,2024],
[504.0,9,0,"Shri Yunushbhai Yusufbhai Afini",2024,2024],
[300.0,9,0,"Shri Ajaybhai Jagubhai Motivaras",2024,2024],
[1842.4,9,0,"Shri Manishbhai Jagubhai Motivaras",2024,2024],
[913.54,9,0,"M/s. Nidhi Sea Food, Shri Kamleshbhai Ratanshi Badarshahi",2024,2024],
[2685.0,9,0,"M/s. Taranhar Fresh Fish, Shri Shaileshbhai Madhavji Baridun",2024,2024],
[234.0,9,0,"M/s. Riddhi Siddhi Sea Food, Shri Hemant Madhavji Baridun",2024,2024],
[5933.02,9,0,"M/s Silver Star Export",2024,2024],
[690.0,9,0,"The Superintendent of Police",2015,2025],
[1110.93,9,0,"Shri Jitendra Mepa Bharada",2015,2025],
[300.0,9,0,"M/s. Kishor Project Ltd.",2015,2025],
[511.0,9,0,"M/s. Kush Trading, Prop. Paresh Premajibhai Bharada",2022,2026],
[492.73,9,0,"Shree Mitesh Jadavaji Posatariya, Anjali Fresh Fish",2022,2026],
[960.0,9,0,"M/s. Monika Sea Foods, Prop. Mr. Nilesh Babulal Khokhari",2022,2026],
[518.92,9,0,"Shri Naran Babubhai Salet",2022,2026],
[586.72,9,0,"M/s.Khushbu Fresh Fish, Prop. Mr. Pratapbhai Premajibhai Gohel",2022,2026],
[80.0,9,0,"Ms. Vanitaben Devjibhai Badarshahi",2022,2026],
[870.76,9,0,"Shri Mahendra Devjibhai Madhvi",2022,2026],
[300.0,9,0,"M/s. Bipin Fish, Prop. Bipin Jadavbhai Bhadrecha",2022,2026],
[275.52,9,0,"Shri Kiran Jadavbhai Chudasama",2022,2026],
[150.0,9,0,"Ms. Vanitaben Devjibhai Badarshahi",2022,2026],
[2049.36,9,0,"M/s. Ekta Fisheries Co-Operative Society",2022,2026],
[960.0,9,0,"Shri Rajesh Babulal Panjari",2022,2026],
[54.05,9,0,"Shri Jayesh Jethalal Shiyal",2022,2026],
[4192.0,9,0,"M/s.Silver Fish Sterilizer",2022,2026],
[1150.0,9,0,"Shree Prakashbhai Ramajibhai Shiyal",2015,2025],
[400.0,9,0,"M/s Milan Matsyaudyog Sahakari Ltd.",2015,2025],
[705.0,10,0,"M/S Vikas Agency, Veraval",1974,2028],
[1350.0,10,0,"Shri Vijay.M.Rughani. Veraval",1976,2001],
[675.0,10,0,"Shri Ibrahim Allarakha Turaq, Veraval",1988,2022],
[1350.0,10,0,"Shri Vinodchandra Vallabhchandra.Veraval",1978,1998],
[675.0,10,0,"Shri Somnath Band Saw Mill. Veraval",1978,2003],
[578.875,10,0,"Shri Divya Ice & Cold Storage. Veraval",1995,2000],
[562.5,10,0,"Shri Shitlakrupa Ice & Cold Storage.Veraval.",1995,2000],
[562.5,10,0,"Shri Anjali Ice & Cold Storage. Veraval.",1995,2005],
[675.0,10,0,"Shri S.Pradipkumar. Maganlal. Veraval",1987,2031],
[675.0,10,0,"Shri Shivam Ice Factory. Veraval",1987,2031],
[631.5,10,0,"Shri Kamet Ice Industries. Veraval",1994,2018],
[633.75,10,0,"Shri Veravali Krupa Ice Factory. Veraval",1991,1996],
[705.0,10,0,"Shri Kailash Ice Factory, Veraval",1990,1995],
[675.59,10,0,"Shri Vishnulaxmi Ice Factory & Cold Storege.Veraval",1992,2025],
[637.5,10,0,"Shri J.K.Ice Factory.Veraval",1991,1996],
[675.0,10,0,"Shri Becharlal Devji Thanki. Veraval",1994,1999],
[709.5,10,0,"Makwana Eng.works&Co. Veraval",1988,2024],
[641.25,10,0,"Shri Himalaya Ice & Cold Storege.Veraval",1991,2031],
[470.0,10,0,"Shri Sunil Ice factory. Veraval",1995,2024],
[1350.0,10,0,"Shri Babubhai Narsibhai Vadhavi, Veraval",2017,2021],
[300.04,10,0,"M/s. Veraval Petroleums,Veraval",2015,2016],
[705.0,10,0,"Shri Parsottam..Bhanji. Kanabar.Veraval.",1994,1999],
[675.0,10,0,"Shri Arvindkumar Ranchhoddas. veraval",1987,1997],
[649.5,10,0,"Shri Subham Ice Product.Veraval",1991,2001],
[705.0,10,0,"Shri Shubham Product.Veraval",1990,2000],
[657.37,10,0,"Shri Cham Treding Orgenizaion. Veraval",1992,1997],
[705.0,10,0,"Shri Lavji Parmanand & co. Veraval",2015,2025],
[707.94,10,0,"Shri Radheshyam Ice & Cold Storage, Veraval",1992,2025],
[225.0,10,0,"Shri Narayan Work Shop. Veraval",1996,2001],
[1800.0,10,0,"Shri Mashru & Co.Veraval.",1972,2021],
[586.05,10,0,"Shri Rahul Marine Enterprises. Veraval",1995,2025],
[899.08,10,0,"Shri Mugal Kaluhusen.Veraval",1996,2001],
[637.5,10,0,"Shri Mahamad Faruk Janmahamad Veraval",1992,2011],
[525.0,10,0,"Shri Padam Auto Service Station. Veraval",1996,2025],
[525.0,10,0,"Shri G.B. Corporation,Veraval",1995,2024],
[900.0,10,0,"Shri Padmanikrupa Ice Factory, Veraval",1987,2026],
[546.375,10,0,"Shri JaiAmbe Ice Factory, Veraval",1991,1996],
[439.125,10,0,"Shri Harikrupa Ice Factory,Veraval",2020,2025],
[406.875,10,0,"Shri Jagdishchandra M Kuhada, Veraval",2011,2036],
[374.625,10,0,"Shri Mehul Diesel Works, Veraval",1995,2014],
[362.08,10,0,"M/s Premji Meghji Ravat, Veraval",1994,2033],
[385.125,10,0,"Shri Ratanshi V Malam Sagar Ice Factory, Veraval",2000,2024],
[352.87,10,0,"Shri Kaushal Engineering Works, Veraval",1990,2024],
[320.625,10,0,"Shri Nathalal Nagji Koria, Veraval",1990,1995],
[290.0,10,0,"Shri Gujarat Marble, Veraval",1990,1995],
[181.125,10,0,"Shri Jaishakti Welding Works, Veraval",1990,2024],
[133.66,10,0,"Shri Sagardeep Spares,Veraval",1995,2024],
[61.8,10,0,"Shri Priyank Engineering & Chemical Works, Veraval",1994,2004],
[35.837,10,0,"Shri M.P.Vaghela,Veraval",2015,2001],
[449.5,10,0,"Shri Om Ice factory,Veraval",1994,1999],
[563.065,10,0,"Shri Narayan Ice Factory, Veraval",1990,2024],
[500.0,10,0,"Shri Trivedi & Sons,Veraval",1991,1996],
[600.0,10,0,"Shri Gangasagar Ice Factory, Veraval",1995,2024],
[600.0,10,0,"Shri Ashaganga Ice Factory, Veraval",1995,2024],
[550.0,10,0,"M/s Keval Exports, Veraval",2007,2031],
[588.5,10,0,"Shri Kanaiya Ice & Cold Storege, Veraval",1996,2001],
[900.0,10,0,"M/s Keval Exports. Veraval",2007,2031],
[900.0,10,0,"Shri Rajdhani Ice factory,Veraval",1995,2024],
[500.0,10,0,"Shri Karsan H Agiya, Veraval",1994,2033],
[600.0,10,0,"M/s Avdhesh Ice Factory, Veraval",1994,2018],
[300.0,10,0,"Swastik Ice & Cold storage, Veraval",1994,2026],
[1200.0,10,0,"Shri Manish Sea Foods, Veraval",1995,2000],
[548.5,10,0,"Shri Manubhai Jivabhai Gadhiya, Veraval",1992,2024],
[581.0,10,0,"Kisan Jadav kuhada, Veraval",1994,2033],
[600.0,10,0,"Shri Krishna Ice Factory,Veraval",1990,2000],
[500.0,10,0,"Shri Ramji Mandan Koriya. Veraval",1992,2026],
[375.0,10,0,"Shri Parag Ice Factory, Veraval",1991,2025],
[450.0,10,0,"Shrinathji Ice & Cold Storage,Veraval",1995,2000],
[450.0,10,0,"Shri Radhe Ice & Cold Storage. Veraval",1995,2024],
[464.25,10,0,"Shri Jai Mahakal Ice & Cold Storage, Veraval",1995,2000],
[448.0,10,0,"Shri Chamunda Ice Products,Veraval",1996,2001],
[420.0,10,0,"Shri Chamunda ice & Cold Storage, Veraval",2015,2025],
[420.0,10,0,"Shri Maruti Ice Factory,Veraval",1990,2024],
[350.0,10,0,"Shri Bachubhai Nathabhai Tank. Veraval",1991,2025],
[706.375,10,0,"Shri Bhagvati Ice factory,Veraval",1992,1997],
[555.0,10,0,"Shri Shivshakti Ice factory,Veraval",1994,1999],
[247.5,10,0,"Shri Lakham R.Suyani, Veraval",1995,2005],
[421.125,10,0,"Parishram Ice plant & cold storage, Veraval",2015,2025],
[416.595,10,0,"Shri Ramabhai Dhanabhai Barad. Veraval",1992,2051],
[446.25,10,0,"KhaKhar weighbridge, Veraval",1994,1999],
[448.2,10,0,"Shri Balaji Workshop,Veraval",1994,1999],
[374.625,10,0,"Shri kishan Damji Bhesla, Veraval",1994,2019],
[601.11,10,0,"Shri Ease Industries, Veraval",1994,2028],
[831.7,10,0,"Shri Vanita Cold storage, Veraval",1995,2029],
[831.7,10,0,"Shri Krishna Ice factory,Veraval",1995,2024],
[831.7,10,0,"Shri khodiyar Ice Factory, Veraval",1995,2000],
[90.0,10,0,"Shri Kiran Electrical Engineering, Veraval",2012,2026],
[667.32,10,0,"Vanita Cold Storage, Veraval",2014,2033],
[846.99,10,0,"Shri Shivshakti Marine Engineering Works, Veraval",1987,2026],
[396.99,10,0,"Shri Makwana Re-powering Works. Veraval",1987,2016],
[1500.0,10,0,"Shri Monark Sea Foods Pvt,Ltd,Veraval",1974,2004],
[1770.0,10,0,"Shri Hindustan Petroliums,Veraval",1974,2004],
[988.0,10,0,"Shri Kanji Jiva Solanki.Veraval",1984,2033],
[990.0,10,0,"Shri Deepmala Marine Exports. Veraval",1995,2020],
[1976.0,10,0,"Shri Saraswati Ice & Cold Storage. Veraval",1994,1999],
[532.0,10,0,"Shri Gangasagar Ice Factory,Veraval",1991,2025],
[1300.0,10,0,"Veraval Industries Association",1999,2004],
[376.0,10,0,"Shri Trikamlal Devji Gohel. Veraval",1974,1994],
[324.0,10,0,"Shri Naran Karshan Malam, Veraval",1975,2000],
[1774.18,10,0,"Shri Veraval Samsat Ghyanti, Veraval",2009,2013],
[928.88,10,0,"Shri Iswarprakash Ice Factory FH-1, Veraval",1994,2028],
[449.84,10,0,"M/s GFCCA Ltd Fish Harbour Partial, Veraval",1971,2026],
[3020.0,10,0,"Shri Castle rock Sea Foods Pvt,Ltd,Veraval",1973,2009],
[3020.0,10,0,"Shri Castle rock Sea Foods Ltd,Veraval",1974,2013],
[3236.55,10,0,"Shri Castle rock cold storage pvt. ltd, Veraval",1989,2014],
[2531.606,10,0,"Shri Central Institute Of Fisheries Technology, Veraval",1971,2031],
[3442.01,10,0,"M/s Kalpataru Exports, Veraval",2009,2023],
[2950.0,10,0,"M/s BMG Fisheries Pvt Ltd, Veraval",1973,1998],
[2229.672,10,0,"Shri Arjundev H Bhesla, Veraval",2015,2025],
[2229.762,10,0,"Shri Maruti Krupa Ice & Cold Storage. Veraval",2014,2024],
[3922.0,10,0,"M/s G L Sheth & BMG Fisheries pvt. Ltd. Veraval",2015,2025],
[595.0,10,0,"Shri Shakti Ice & Cold Storage, Veraval",1986,2000],
[1005.0,10,0,"Shri Parishram Ice & Cold Storege, Veraval",1986,2000],
[310.0,10,0,"M/s GFCCA Ltd Fueling, Veraval",1971,2035],
[55.742,10,0,"Shri Babubhai Ramjibhai Jungi. Veraval",2015,2025],
[55.742,10,0,"Shri Madhu Damji Khapandi, Veraval",1995,2000],
[760.0,10,0,"Shri Grives Cotton & Co. Veraval",1971,2014],
[660.0,10,0,"Shi Urmi Marine Engineering Works,Veraval",1986,2030],
[2960.0,10,0,"Fisheries Dept Service Station, Veraval",1993,2008],
[3810.94,10,0,"Shri Veraval Marine & Chemical Pvt,Ltd,Veraval",1978,2023],
[2010.0,10,0,"Shri Konkan Fisheries Pvt,Ltd. Veraval",1971,2011],
[743.22,10,0,"Shri Konkan Fisheries Pvt,Ltd. Veraval",2015,2025],
[873.47,10,0,"M/s Veraval Marine & Chemicals Pvt,Ltd. Veraval",1995,2025],
[2607.56,10,0,"Shri Hariom Ice & Cold Storage, Veraval",1986,2001],
[288.0,10,0,"Shri Saraswati Ice & Cold Storage, Veraval",2015,2025],
[1660.0,10,0,"M/s Deepmala Marine FH-58, Veraval",2011,2025],
[180.0,10,0,"Shri Matsya Vikas Kendra. Veraval",2014,2014],
[67.38,10,0,"Shri Mansukhlal Ramji Suyani. Veraval",1982,2026],
[67.1,10,0,"Shri Jamnadas Hemraj Dodia. Veraval",1981,2025],
[70.0,10,0,"Shri Somnath Marine spares & Storage Depot, Veraval",2015,2025],
[80.0,10,0,"Shri Pithadia Freezing & Cold storage, Veraval",2015,2025],
[74.32,10,0,"Shri Harilal Virji Pithadia. Veraval",2015,2025],
[214.5,10,0,"M/s Pithadiya Frizing & Cold Storage. Veraval",1995,2000],
[1160.83,10,0,"Dinesh Sea Foods, Veraval",2014,2018],
[99.98,10,0,"Rameshchandra Arjan Fofandi, Veraval",2013,2027],
[2859.15,10,0,"Shri Iswarprakash Ice factory, Veraval",2018,2022],
[1002.93,10,0,"Shri Anurag Sea Foods, Veraval",1996,2011],
[1670.78,10,0,"M/s Elite Ship Yard. Veraval.",1995,2016],
[1989.53,10,0,"M/s Veraval Shipping corporation. Veraval.",1996,2001],
[625.0,10,0,"Shri Jai Sagar Matsyodhog Co.Op. Society Ltd, Veraval",1993,2022],
[1168.21,10,0,"Shri R.J. Trivedi. Veraval",1971,2015],
[4935.94,10,0,"M/s VRL / Veraval Machchhi Kharid Vechan Suppliers",1952,2012],
[208.82,10,0,"Shri Vallabh Haridas & Co. Veraval.",2000,2014],
[400.0,10,0,"M/s G.F.C.C.A.Ltd, Veraval",2000,2010],
[450.0,10,0,"Shri Jafrabad Machhi Khari-Vechan Sangh, Jafrabad",2000,2005],
[743.59,10,0,"M/s faruq Mohamad Pirani & Co, Veraval",1991,2001],
[49.92,10,0,"Shri Trikamlal. N. Agya. Veraval",2015,2025],
[1114.0,10,0,"M/s GFCCA Ltd Ice Factory, Veraval",2015,2025],
[800.0,10,0,"M/s Parishram Mastyodhyog Co.Op.Mandali,Ltd, Veraval",1995,2024],
[604.08,10,0,"Shri Jalaram Ice Factory, Veraval",1995,2019],
[94.84,10,0,"Shri Kharva Machhimar Boat Association, Veraval",1996,2015],
[9840.0,10,0,"M/s GFCCA Ltd Boat Building Yard, Veraval",1972,2026],
[185.92,10,0,"Shri Kasambhai A. Veraval.",1991,2020],
[540.958,10,0,"Shri Babu. Jamal. Patni. Veraval",1991,1996],
[557.689,10,0,"M/s Iqubal Haji Ibrahim Aybani. Veraval.",1991,2001],
[625.0,10,0,"M/s Mahesh Saw Mills Veraval",1994,1997],
[321.5,10,0,"M/s Bipinchandra Amratlal Pandat. Veraval.",1990,2019],
[4141.0,10,0,"Coast Guard Godown, Veraval",2015,2025],
[1993.39,10,0,"M/s Bharat Petroleum Corporation, Veraval",2015,2025],
[23886.68,10,0,"M/s Sorath Onion Merchant Association, Veraval",2015,2025],
[1000.0,10,0,"The District Superintendent of Police, Junagadh. Marine Police",2015,2007],
[2000.0,10,0,"Shri Mansukh Ramji Suyani Naliya Godi Area, at Veraval",2015,2024],
[200.0,10,0,"Shri Chamunda Ice & Cold Storage, Veraval",2013,2017],
[841.66,10,0,"Shri Honest Ice & Cold Storage, Veraval",2014,2018],
[300.04,10,0,"Veraval Petroleums, Veraval",2015,2025],
[720.0,10,0,"Chandrakant & Co., Veraval",2017,2026],
[375.0,10,0,"Shri Ganesh Sagar Petroleum, Veraval",2018,2022],
[1425.0,10,0,"M/s. Kalyan Ice & Cold Storage, Mangrol",2022,2022],
// ─── LPA / Concession / Reclaimed ───────────────────────────────────────────
// Format: [area, portIdx, lpaCode, name, leaseStart, leaseEnd, acqCr, BASE_rent_at_allotment]
// BASE_rent_at_allotment = annual rent at time of allotment (₹/yr)
// Dashboard escalates this to CY using LPA escalation settings in Control Panel
[485910,11,1,"M/s Petronet LNG Limited",1999,2029,9.70,10932975],
[135708,11,1,"Adani Petronet Dahej Port Pvt Ltd (Plot 1)",2009,2039,2.71,14534416],
[115367,11,1,"Adani Petronet Dahej Port Pvt Ltd (Plot 2)",2009,2039,2.31,7803772],
[4090000,12,2,"M/s Hazira Port Pvt Ltd (409 Ha - Reclaimed)",2007,2037,0.00,1],
[13777009,13,1,"Gujarat Adani Port Ltd / APSEZL Mundra",2000,2030,7.00,2380182],
[471120,2,1,"Swan LNG Pvt Ltd (47.112 Ha) Jafrabad",2017,2047,7.10,56223445],
[47432,1,1,"Bhavnagar Port Infrastructure Pvt Ltd",2024,2054,14.20,14798800],
[84800,2,1,"Swan LNG Pvt Ltd - Additional Plot (Proposed) Jafrabad",2025,2055,0.00,0],
[164610,1,1,"Bhavnagar Port Infra Pvt Ltd - Additional (Proposed)",2025,2055,0.00,0],
[288501,4,1,"Nauyaan Shipyard Private Ltd",2025,2055,14.40,14183164],
[11460,4,1,"Modest Infrastructure Private Ltd",2007,2037,0.46,343800]
];

const SCEN_KEYS = ['sopc_cur','sopc_rev','opt1','opt2','opt3','opt4','opt5','opt6'];
const SCEN_META = {
  sopc_cur:{label:'SoPC Current',       short:'SoPC Cur', color:'#1e40af',bg:'#dbeafe',rec:false},
  sopc_rev:{label:'SoPC Revised',       short:'SoPC Rev', color:'#1d4ed8',bg:'#bfdbfe',rec:false},
  opt1:    {label:'Opt 1 — Fresh Val',  short:'Opt 1',    color:'#6d28d9',bg:'#ede9fe',rec:false},
  opt2:    {label:'Opt 2 — 40% Factor', short:'Opt 2',    color:'#7c3aed',bg:'#f5f3ff',rec:false},
  opt3:    {label:'Opt 3 — Continue',   short:'Opt 3',    color:'#065f46',bg:'#d1fae5',rec:false},
  opt4:    {label:'Opt 4 — Last+WPI',   short:'Opt 4',    color:'#0f766e',bg:'#ccfbf1',rec:false},
  opt5:    {label:'Opt 5 — 50% Hike',   short:'Opt 5',    color:'#92400e',bg:'#fef3c7',rec:false},
  opt6:    {label:'Opt 6 — Block ✓ REC',short:'Opt 6 ✓',  color:'#14532d',bg:'#bbf7d0',rec:true},
};
const TYPE_META = {
  sopc:              {label:'SoPC Ordinary',      color:'#1e40af',bg:'#dbeafe'},
  lpa:               {label:'LPA Firm Land',       color:'#6d28d9',bg:'#ede9fe'},
  reclaimed_pre2018: {label:'Reclaimed Pre-2018',  color:'#92400e',bg:'#fef3c7'},
  reclaimed_post2018:{label:'Reclaimed Post-2018', color:'#065f46',bg:'#d1fae5'},
};
const STATUS_META = {
  active:   {label:'Active',   color:'#065f46',bg:'#d1fae5'},
  expiring: {label:'<5 yrs',   color:'#92400e',bg:'#fef3c7'},
  expired:  {label:'Expired',  color:'#991b1b',bg:'#fee2e2'},
};

// ═══════════════════════════════════════ UTILITIES ════════════════════════════
function margF(area,bounds,pcts){const br=[0,...bounds,Infinity];let w=0,a=0;for(let i=0;i<4;i++){const c=Math.max(0,Math.min(area,br[i+1])-br[i]);if(!c)break;w+=c*pcts[i];a+=c;}return a?w/a:pcts[0];}
function slabI(area,b){return area<=b[0]?0:area<=b[1]?1:area<=b[2]?2:3;}
function calcIRR(cfs){
  if(!cfs||cfs.length<2)return null;
  let r=0.08;
  for(let i=0;i<200;i++){let n=0,d=0;for(let t=0;t<cfs.length;t++){const pv=Math.pow(1+r,t);n+=cfs[t]/pv;d-=t*cfs[t]/Math.pow(1+r,t+1);}if(Math.abs(d)<1e-12)break;const r1=r-n/d;if(Math.abs(r1-r)<1e-8){r=r1;break;}r=Math.max(-0.99,Math.min(9,r1));}
  return isNaN(r)||!isFinite(r)?null:r;
}
function getAnnGrowth(c){
  if(c.escType==='wpi')return c.wpiRate/100;
  if(c.escType==='10pct3yr')return Math.pow(1.1,1/3)-1;
  if(c.escType==='20pct3yr')return Math.pow(1.2,1/3)-1;
  return Math.pow(1+c.escPct/100,1/Math.max(1,c.escPeriod))-1;
}
// FIX 1: LPA current rent escalation (applied backward from allotment year to CY)
function getLpaEscGrowth(c){
  if(c.lpaEscType==='wpi')return c.lpaWpiRate/100;
  if(c.lpaEscType==='10pct3yr')return Math.pow(1.1,1/3)-1;
  if(c.lpaEscType==='20pct3yr')return Math.pow(1.2,1/3)-1;
  return Math.pow(1+c.lpaEscPct/100,1/Math.max(1,c.lpaEscPeriod))-1;
}
function getFreshPct(c){if(c.freshPctMode==='1.5')return 1.5;if(c.freshPctMode==='6')return 6;return c.freshPctCustom||10;}
// Updated buildCFs: curRentEsc = escalation rate during remaining lease (0 = flat)
function buildCFs(inv,yr1PostExp,gPostExp,horizon,residual,expiry,curRent,curRentEsc){
  if(inv<=0)return null;
  const cfs=[-inv];
  const yToExp=Math.max(0,expiry-CY);
  const esc=curRentEsc||0;
  for(let y=1;y<=horizon;y++){
    if(y<=yToExp){cfs.push(curRent*Math.pow(1+esc,y));}
    else{cfs.push(yr1PostExp*Math.pow(1+gPostExp,y-yToExp-1));}
  }
  cfs[cfs.length-1]+=residual;
  return cfs;
}
function fmtCr(v){const c=v/1e7;if(Math.abs(c)>=100)return'₹'+Math.round(c)+' Cr';if(Math.abs(c)>=1)return'₹'+c.toFixed(2)+' Cr';return'₹'+(v/1e5).toFixed(1)+' L';}
function fmtPct(v){return v===null?'—':(v*100).toFixed(1)+'%';}
function fmtChg(v,base){if(!base||base===0)return'—';const p=((v-base)/Math.abs(base))*100;return(p>=0?'+':'')+p.toFixed(0)+'%';}
function fmtMx(v,base){if(!base||base===0)return'—';return(v/base).toFixed(2)+'×';}
function fmtA(a){return a>=10000?(a/10000).toFixed(2)+' Ha':a.toLocaleString('en-IN',{maximumFractionDigits:0})+' sqm';}

// ═══════════════════════════════════════ BUILD PLOTS ══════════════════════════
let _id=0;
function buildPlots(){
  return RAW.map(function(row){
    const area=row[0],portIdx=row[1],lpaCode=row[2],name=row[3];
    const leaseStart=row[4]||2015,leaseEnd=row[5]||2025;
    const acqCr=row[6]||0;
    const rentOverride=(row[7]!==undefined&&row[7]!==null)?row[7]:null;
    const port=PORT_NAMES[portIdx];
    const pgIdx=PG_IDX[port]!==undefined?PG_IDX[port]:0;
    const landType=lpaCode===0?'sopc':lpaCode===1?'lpa':'reclaimed_pre2018';
    const leaseTerm=Math.max(5,leaseEnd-leaseStart);
    // currentRent = BASE rent at allotment for LPA; SoPC rate × area for SoPC
    const currentRent=rentOverride!==null?rentOverride:(area/10)*1018;
    return{id:_id++,name,port,portIdx,pgIdx,landType,area,currentRent,leaseStart,leaseTerm,acqCr,indivVal:null,acqValPsqm:null,recYear:lpaCode===2?leaseStart:null,notes:''};
  });
}
const INIT_PLOTS=buildPlots();

// ═══════════════════════════════════════ DELTA HELPERS ════════════════════════
function computeDelta(plots){
  const baseById={};INIT_PLOTS.forEach(function(p){baseById[p.id]=p;});
  const added=[],modified={},deletedIds=[];
  plots.forEach(function(p){
    if(!baseById[p.id]){added.push(p);}
    else{const base=baseById[p.id],diff={};Object.keys(p).forEach(function(k){if(JSON.stringify(p[k])!==JSON.stringify(base[k]))diff[k]=p[k];});if(Object.keys(diff).length>0)modified[p.id]=diff;}
  });
  const cur=new Set(plots.map(function(p){return p.id;}));
  INIT_PLOTS.forEach(function(p){if(!cur.has(p.id))deletedIds.push(p.id);});
  return{added,modified,deleted:deletedIds};
}
function applyDelta(delta){
  const mod=delta.modified||{};
  const del=new Set(delta.deleted||[]);
  const result=INIT_PLOTS.filter(function(p){return!del.has(p.id);}).map(function(p){return mod[p.id]?Object.assign({},p,mod[p.id]):p;});
  (delta.added||[]).forEach(function(p){result.push(p);});
  return result;
}

// ═══════════════════════════════════════ DEFAULT CONTROLS ═════════════════════
const DEF_CTRL={
  sopcCurRate:1018, sopcRevRate:1200,
  sopcProjWpi:5,        // FIX 2: WPI for SoPC 30-yr projection
  portVals:{Alang:3000,Bhavnagar:5000,Jafrabad:2500,Jamnagar:4000,Magdalla:6000,Mandvi:3000,Mangrol:2000,Navlakhi:2000,Okha:3000,Porbandar:4000,Veraval:3000,Dahej:7000,Hazira:8000,Mundra:10000},
  portAcq:{Alang:200,Bhavnagar:300,Jafrabad:175,Jamnagar:250,Magdalla:350,Mandvi:200,Mangrol:150,Navlakhi:150,Okha:200,Porbandar:250,Veraval:200,Dahej:400,Hazira:450,Mundra:500},
  slabBounds:[1000,10000,100000],slabPcts:[100,90,70,50],slabUF:[90,85,70,35],
  freshPctMode:'6',freshPctCustom:10,
  escType:'20pct3yr',escPct:20,escPeriod:3,wpiRate:6,
  blockPct:50,blockYrs:15,numBlocks:3,
  reclPct:20,rebateYrs:10,rebateDiscount:50,
  holdoverOn:false,penaltyMult:3,
  irrHorizon:30,residualPct:100,
  // FIX 1: LPA current rent escalation (backward from allotment to CY)
  lpaEscType:'wpi',lpaWpiRate:6,lpaEscPct:20,lpaEscPeriod:3,
};

// ═══════════════════════════════════════ STYLE HELPERS ════════════════════════
const INP={border:'1px solid #d1d5db',borderRadius:4,padding:'3px 7px',fontSize:11,background:'#fff',color:'#111',width:76};
const SEL={border:'1px solid #d1d5db',borderRadius:4,padding:'3px 6px',fontSize:11,background:'#fff',color:'#111'};
const TH={fontSize:10,fontWeight:600,color:'#6b7280',padding:'5px 7px',textAlign:'left',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',whiteSpace:'nowrap'};
const TD={fontSize:11,padding:'5px 7px',borderBottom:'1px solid #f3f4f6',verticalAlign:'middle'};
function btnS(act,col){return{fontSize:11,padding:'5px 13px',borderRadius:5,cursor:'pointer',border:'none',background:act?(col||'#1e40af'):'#f3f4f6',color:act?'#fff':'#374151',fontWeight:act?700:400};}
function badge(color,bg){return{fontSize:9,padding:'2px 7px',borderRadius:10,background:bg,color,fontWeight:700,display:'inline-block'};}

// ═══════════════════════════════════════ CP HELPERS ═══════════════════════════
function CPSec({label,open,onToggle,children}){
  return(
    <div style={{marginBottom:6,border:'1px solid #e5e7eb',borderRadius:6,overflow:'hidden'}}>
      <button onClick={onToggle} style={{width:'100%',textAlign:'left',background:open?'#1e40af':'#f9fafb',color:open?'#fff':'#374151',border:'none',padding:'6px 10px',fontSize:10,fontWeight:700,cursor:'pointer',display:'flex',justifyContent:'space-between'}}>
        {label}<span>{open?'▲':'▼'}</span>
      </button>
      {open&&<div style={{padding:'8px 10px',background:'#fff'}}>{children}</div>}
    </div>
  );
}
function CPRow({label,children}){return(<div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:10,color:'#374151',flexShrink:0,marginRight:6}}>{label}</span>{children}</div>);}
function Slider({val,min,max,step,color,onChange,suffix}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:6}}>
      <input type="range" min={min} max={max} step={step} value={val} onChange={function(e){onChange(Number(e.target.value));}} style={{flex:1,accentColor:color||'#1e40af',height:3}}/>
      <span style={{fontSize:10,fontWeight:700,color:color||'#1e40af',minWidth:30}}>{val}{suffix}</span>
    </div>
  );
}

// ═══════════════════════════════════════ CONTROL PANEL ════════════════════════
function ControlPanel({c,setC}){
  const [open,setOpen]=useState({rates:true,pvals:false,slab:true,fresh:true,esc:true,opt6:true,recl:false,hold:false,lpaesc:true,irr:false});
  const tog=function(k){setOpen(function(o){return{...o,[k]:!o[k]};});};
  const upd=function(k,v){setC(function(p){return{...p,[k]:v};});};
  const updPV=function(port,v){setC(function(p){return{...p,portVals:{...p.portVals,[port]:v}};});};
  const updAcq=function(port,v){setC(function(p){return{...p,portAcq:{...p.portAcq,[port]:v}};});};
  const updSlab=function(key,idx,v){setC(function(p){const a=[...p[key]];a[idx]=v;return{...p,[key]:a};});};
  const lpaAnn=(getLpaEscGrowth(c)*100).toFixed(2);
  return(
    <div style={{width:240,flexShrink:0,overflowY:'auto',height:'100%',padding:'0 0 20px',borderRight:'1px solid #e5e7eb',background:'#fafafa'}}>
      <div style={{padding:'10px 10px 6px',borderBottom:'1px solid #e5e7eb',marginBottom:6}}>
        <p style={{fontSize:12,fontWeight:800,color:'#1e40af',margin:0}}>Control Panel</p>
        <p style={{fontSize:9,color:'#9ca3af',margin:'2px 0 0'}}>Adjust all parameters</p>
      </div>
      <div style={{padding:'0 6px'}}>

        {/* A — SoPC Rates */}
        <CPSec label="A — SoPC Rates" open={open.rates} onToggle={function(){tog('rates');}}>
          <CPRow label="Current Rate (₹/10sqm)"><input type="number" style={INP} value={c.sopcCurRate} step={10} onChange={function(e){upd('sopcCurRate',Number(e.target.value));}}/></CPRow>
          <CPRow label="Revised Rate (₹/10sqm)"><input type="number" style={INP} value={c.sopcRevRate} step={10} onChange={function(e){upd('sopcRevRate',Number(e.target.value));}}/></CPRow>
          <div style={{background:'#eff6ff',borderRadius:5,padding:'6px 8px',marginTop:4}}>
            <CPRow label="WPI for 30-yr Projection (%)">
              <input type="number" style={INP} value={c.sopcProjWpi} step={0.5} min={0} max={20} onChange={function(e){upd('sopcProjWpi',Number(e.target.value));}}/>
            </CPRow>
            <p style={{fontSize:9,color:'#1e40af',margin:0}}>Applied to SoPC Cur & Rev in 30-yr revenue projection</p>
          </div>
        </CPSec>

        {/* B — Port Valuations */}
        <CPSec label="B — Port Jantri Valuations" open={open.pvals} onToggle={function(){tog('pvals');}}>
          {PORT_NAMES.map(function(p){return(
            <CPRow key={p} label={p+' (₹/sqm)'}><input type="number" style={INP} value={c.portVals[p]||3000} step={100} onChange={function(e){updPV(p,Number(e.target.value));}}/></CPRow>
          );})}
          <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Acquisition (₹/sqm):</p>
          {PORT_NAMES.map(function(p){return(
            <CPRow key={'a'+p} label={p}><input type="number" style={INP} value={c.portAcq[p]||300} step={25} onChange={function(e){updAcq(p,Number(e.target.value));}}/></CPRow>
          );})}
        </CPSec>

        {/* C — Slab */}
        <CPSec label="C — Slab Configuration" open={open.slab} onToggle={function(){tog('slab');}}>
          {['I','II','III','IV'].map(function(s,i){return(
            <div key={s} style={{marginBottom:6,padding:'5px 7px',background:'#f9fafb',borderRadius:5}}>
              <p style={{fontSize:9,fontWeight:700,color:'#374151',margin:'0 0 4px'}}>Slab {s}</p>
              <CPRow label="Weightage %"><Slider val={c.slabPcts[i]} min={30} max={100} step={5} onChange={function(v){updSlab('slabPcts',i,v);}} suffix="%"/></CPRow>
              <CPRow label="UF %"><Slider val={c.slabUF[i]} min={10} max={100} step={5} onChange={function(v){updSlab('slabUF',i,v);}} suffix="%"/></CPRow>
            </div>
          );})}
        </CPSec>

        {/* D — Fresh Valuation */}
        <CPSec label="D — Fresh Valuation %" open={open.fresh} onToggle={function(){tog('fresh');}}>
          <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
            {[['1.5','1.5%'],['6','6%'],['custom','Custom']].map(function(o){return(
              <button key={o[0]} onClick={function(){upd('freshPctMode',o[0]);}} style={btnS(c.freshPctMode===o[0],'#6d28d9')}>{o[1]}</button>
            );})}
          </div>
          {c.freshPctMode==='custom'&&<CPRow label="Custom %"><input type="number" style={INP} value={c.freshPctCustom} step={0.5} onChange={function(e){upd('freshPctCustom',Number(e.target.value));}}/></CPRow>}
        </CPSec>

        {/* E — Escalation Opt 3-6 */}
        <CPSec label="E — Escalation (Opt 3–6)" open={open.esc} onToggle={function(){tog('esc');}}>
          <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
            {[['10pct3yr','10%/3yr'],['20pct3yr','20%/3yr'],['wpi','WPI%'],['custom','Custom']].map(function(o){return(
              <button key={o[0]} onClick={function(){upd('escType',o[0]);}} style={btnS(c.escType===o[0],'#0f766e')}>{o[1]}</button>
            );})}
          </div>
          {c.escType==='wpi'&&<CPRow label="WPI Rate %"><Slider val={c.wpiRate} min={1} max={15} step={0.5} color="#0f766e" onChange={function(v){upd('wpiRate',v);}} suffix="%"/></CPRow>}
          {c.escType==='custom'&&<>
            <CPRow label="Escalation %"><Slider val={c.escPct} min={5} max={50} step={5} color="#0f766e" onChange={function(v){upd('escPct',v);}} suffix="%"/></CPRow>
            <CPRow label="Every N yrs"><Slider val={c.escPeriod} min={1} max={10} step={1} color="#0f766e" onChange={function(v){upd('escPeriod',v);}} suffix="yr"/></CPRow>
          </>}
          <p style={{fontSize:9,color:'#9ca3af',marginTop:4}}>Annual eq: <strong>{(getAnnGrowth(c)*100).toFixed(2)}% p.a.</strong></p>
        </CPSec>

        {/* F — Option 6 Block */}
        <CPSec label="F — Option 6 Block ✓ REC" open={open.opt6} onToggle={function(){tog('opt6');}}>
          <CPRow label="Hike % on Existing"><Slider val={c.blockPct} min={10} max={200} step={5} color="#14532d" onChange={function(v){upd('blockPct',v);}} suffix="%"/></CPRow>
        </CPSec>

        {/* G — Reclaimed Land */}
        <CPSec label="G — Reclaimed Land" open={open.recl} onToggle={function(){tog('recl');}}>
          <CPRow label="Reclaimed Rent Factor %"><Slider val={c.reclPct} min={5} max={100} step={5} color="#92400e" onChange={function(v){upd('reclPct',v);}} suffix="%"/></CPRow>
          <CPRow label="Rebate Period (yrs)"><input type="number" style={INP} value={c.rebateYrs} step={1} onChange={function(e){upd('rebateYrs',Number(e.target.value));}}/></CPRow>
          <CPRow label="Rebate Discount %"><Slider val={c.rebateDiscount} min={0} max={80} step={5} color="#92400e" onChange={function(v){upd('rebateDiscount',v);}} suffix="%"/></CPRow>
        </CPSec>

        {/* H — Holdover */}
        <CPSec label="H — Holdover / Penalty" open={open.hold} onToggle={function(){tog('hold');}}>
          <CPRow label="Apply Penalty">
            <button onClick={function(){upd('holdoverOn',!c.holdoverOn);}} style={btnS(c.holdoverOn,'#991b1b')}>{c.holdoverOn?'ON':'OFF'}</button>
          </CPRow>
          {c.holdoverOn&&<CPRow label="Penalty Multiplier"><Slider val={c.penaltyMult} min={1.5} max={5} step={0.5} color="#991b1b" onChange={function(v){upd('penaltyMult',v);}} suffix="×"/></CPRow>}
        </CPSec>

        {/* J — LPA Escalation (FIX 1: new section) */}
        <CPSec label="J — LPA Current Rent Escalation" open={open.lpaesc} onToggle={function(){tog('lpaesc');}}>
          <div style={{background:'#ede9fe',borderRadius:5,padding:'5px 8px',marginBottom:7,fontSize:9,color:'#5b21b6',lineHeight:1.6}}>
            Applied backward from allotment year to {CY} to show <strong>current effective rent</strong> for LPA plots (e.g. Petronet 1999→{CY} = {CY-1999} yrs escalation).
          </div>
          <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
            {[['10pct3yr','10%/3yr'],['20pct3yr','20%/3yr'],['wpi','WPI%'],['custom','Custom']].map(function(o){return(
              <button key={o[0]} onClick={function(){upd('lpaEscType',o[0]);}} style={btnS(c.lpaEscType===o[0],'#6d28d9')}>{o[1]}</button>
            );})}
          </div>
          {c.lpaEscType==='wpi'&&<CPRow label="WPI Rate %"><Slider val={c.lpaWpiRate} min={1} max={15} step={0.5} color="#6d28d9" onChange={function(v){upd('lpaWpiRate',v);}} suffix="%"/></CPRow>}
          {c.lpaEscType==='custom'&&<>
            <CPRow label="Escalation %"><Slider val={c.lpaEscPct} min={5} max={50} step={5} color="#6d28d9" onChange={function(v){upd('lpaEscPct',v);}} suffix="%"/></CPRow>
            <CPRow label="Every N yrs"><Slider val={c.lpaEscPeriod} min={1} max={10} step={1} color="#6d28d9" onChange={function(v){upd('lpaEscPeriod',v);}} suffix="yr"/></CPRow>
          </>}
          <p style={{fontSize:9,color:'#6d28d9',marginTop:4}}>Annual eq: <strong>{lpaAnn}% p.a.</strong></p>
        </CPSec>

        {/* I — IRR */}
        <CPSec label="I — IRR Settings" open={open.irr} onToggle={function(){tog('irr');}}>
          <CPRow label="Horizon (yrs)"><input type="number" style={INP} value={c.irrHorizon} step={5} onChange={function(e){upd('irrHorizon',Number(e.target.value));}}/></CPRow>
          <CPRow label="Residual %"><Slider val={c.residualPct} min={0} max={200} step={10} onChange={function(v){upd('residualPct',v);}} suffix="%"/></CPRow>
        </CPSec>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════ PLOT EDITOR ══════════════════════════
function PlotEditor({plot,onSave,onDelete,onClose,isNew}){
  const [v,setV]=useState(plot?{...plot}:{id:null,name:'New Plot',port:'Alang',portIdx:0,pgIdx:0,landType:'sopc',area:1000,currentRent:0,leaseStart:2015,leaseTerm:10,acqCr:0,indivVal:null,acqValPsqm:null,recYear:null,notes:''});
  const upd=function(k,val){setV(function(p){return{...p,[k]:val};});};
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'#fff',borderRadius:10,width:'min(96vw,480px)',maxHeight:'90vh',overflowY:'auto',padding:20,boxShadow:'0 20px 60px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:14}}>
          <p style={{fontSize:14,fontWeight:700,margin:0,color:'#111'}}>{isNew?'Add Plot':'Edit Plot'}</p>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:'#9ca3af',fontWeight:700}}>×</button>
        </div>
        {[['name','Name','text'],['area','Area (sqm)','number'],['leaseStart','Lease Start (yr)','number'],['leaseTerm','Lease Term (yrs)','number'],['acqCr','Acq. Cost (₹ Cr)','number']].map(function(f){return(
          <div key={f[0]} style={{marginBottom:10}}>
            <label style={{fontSize:10,color:'#6b7280',display:'block',marginBottom:3}}>{f[1]}</label>
            <input type={f[2]} style={{...INP,width:'100%',boxSizing:'border-box'}} value={v[f[0]]||''} onChange={function(e){upd(f[0],f[2]==='number'?Number(e.target.value):e.target.value);}}/>
          </div>
        );})}
        <div style={{marginBottom:10}}>
          <label style={{fontSize:10,color:'#6b7280',display:'block',marginBottom:3}}>
            Base Rent at Allotment (₹/yr)
            <span style={{color:'#6d28d9',fontSize:9,marginLeft:4}}>[LPA: initial rent; dashboard applies escalation to CY]</span>
          </label>
          <input type="number" style={{...INP,width:'100%',boxSizing:'border-box'}} value={v.currentRent||0} onChange={function(e){upd('currentRent',Number(e.target.value));}}/>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:10,color:'#6b7280',display:'block',marginBottom:3}}>Port</label>
          <select style={{...SEL,width:'100%'}} value={v.port} onChange={function(e){const pi=PORT_NAMES.indexOf(e.target.value);upd('port',e.target.value);upd('portIdx',pi);upd('pgIdx',PG_IDX[e.target.value]||0);}}>
            {PORT_NAMES.map(function(p){return <option key={p}>{p}</option>;})}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:10,color:'#6b7280',display:'block',marginBottom:3}}>Land Type</label>
          <select style={{...SEL,width:'100%'}} value={v.landType} onChange={function(e){upd('landType',e.target.value);}}>
            {Object.entries(TYPE_META).map(function(e2){return <option key={e2[0]} value={e2[0]}>{e2[1].label}</option>;})}
          </select>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:10,color:'#6b7280',display:'block',marginBottom:3}}>Individual Jantri (₹/sqm, blank=port default)</label>
          <input type="number" style={{...INP,width:'100%',boxSizing:'border-box'}} value={v.indivVal||''} onChange={function(e){upd('indivVal',e.target.value?Number(e.target.value):null);}}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:10,color:'#6b7280',display:'block',marginBottom:3}}>Notes</label>
          <input style={{...INP,width:'100%',boxSizing:'border-box'}} value={v.notes||''} onChange={function(e){upd('notes',e.target.value);}}/>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
          {!isNew&&<button onClick={function(){if(window.confirm('Delete this plot?'))onDelete(v.id);}} style={btnS(true,'#991b1b')}>Delete</button>}
          <button onClick={onClose} style={btnS(false)}>Cancel</button>
          <button onClick={function(){onSave(v);}} style={btnS(true,'#1e40af')}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════ ROW DETAIL POPUP (FIX 4) ════════════
// Changed from right-sidebar drawer to centered modal popup
function RowDetail({row,onClose,onEdit,ctrl}){
  const p=row.p,ex=row.existing;
  const rents=row.rents,irrs=row.irrs;
  const postExpiryRents=row.postExpiryRents||rents;
  const isActiveLpa=row.isActiveLpa||false;
  const tm=TYPE_META[p.landType]||TYPE_META.sopc;
  const sm=STATUS_META[p.status]||STATUS_META.active;
  const [showProj,setShowProj]=useState(false);

  const g=ctrl?getAnnGrowth(ctrl):0.063;
  const sopcWpi=ctrl?(ctrl.sopcProjWpi/100):0.05;
  const lpaEsc=ctrl&&p.landType==='lpa'?getLpaEscGrowth(ctrl):0;
  const expiry=p.expiry||((p.leaseStart||CY)+(p.leaseTerm||30));
  const projYears=30;

  // Per-plot 30yr projection (FIX 2+3: SoPC uses sopcProjWpi; LPA locked during lease)
  function buildYearProj(k){
    const yr1=postExpiryRents[k];
    const yToExp=Math.max(0,expiry-CY);
    const gK=(k==='sopc_cur'||k==='sopc_rev')?sopcWpi:g;
    return Array.from({length:projYears},function(_,i){
      const y=i+1;
      if(y<=yToExp)return ex*Math.pow(1+lpaEsc,y); // LPA escalates contractually; SoPC flat
      return yr1*Math.pow(1+gK,y-yToExp-1);         // post-expiry scenario escalation
    });
  }
  function buildExistingProj(){
    const yToExp=Math.max(0,expiry-CY);
    return Array.from({length:projYears},function(_,i){
      const y=i+1;
      if(y<=yToExp)return ex*Math.pow(1+lpaEsc,y);
      return ex*Math.pow(1+lpaEsc,yToExp); // flat at lease-end rate after expiry
    });
  }

  const projByScen={};
  SCEN_KEYS.forEach(function(k){projByScen[k]=buildYearProj(k);});
  const projExisting=buildExistingProj();

  return(
    // FIX 4: Centered popup overlay (click backdrop to close)
    <div onClick={function(e){if(e.target===e.currentTarget)onClose();}}
      style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:999,
        display:'flex',alignItems:'flex-start',justifyContent:'center',
        overflowY:'auto',padding:'20px 12px'}}>
      <div style={{background:'#fff',borderRadius:12,width:'min(97vw,1300px)',
        marginTop:'auto',marginBottom:'auto',minWidth:700,
        boxShadow:'0 24px 64px rgba(0,0,0,0.25)',padding:'1.25rem 1.5rem'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
          <div>
            <p style={{fontWeight:700,fontSize:14,margin:0,color:'#111',lineHeight:1.3}}>{p.name}</p>
            <p style={{fontSize:10,color:'#6b7280',margin:'3px 0 0'}}>
              {p.port} · {fmtA(p.area)} · <span style={badge(tm.color,tm.bg)}>{tm.label}</span>{' '}<span style={badge(sm.color,sm.bg)}>{sm.label}</span>
            </p>
          </div>
          <div style={{display:'flex',gap:5,flexShrink:0,marginLeft:10}}>
            <button onClick={onEdit} style={btnS(true,'#6d28d9')}>✏ Edit</button>
            <button onClick={onClose} style={{background:'none',border:'1px solid #e5e7eb',borderRadius:5,fontSize:18,cursor:'pointer',color:'#9ca3af',padding:'3px 12px',fontWeight:700,lineHeight:1}}>×</button>
          </div>
        </div>

        {/* FIX 3: Active LPA notice */}
        {isActiveLpa&&(
          <div style={{background:'#fef3c7',border:'1px solid #f59e0b',borderRadius:6,padding:'6px 12px',marginBottom:8,fontSize:10,color:'#78350f',lineHeight:1.6}}>
            <strong>📋 Active Concession / LPA Agreement</strong> — Lease expires {expiry} ({Math.max(0,expiry-CY)} yrs remaining).
            Revenue under all policy scenarios is <strong>contractually locked</strong> at existing escalated rent during this tenure.
            Post-expiry proposed rates (used for IRR) are shown separately below.
          </div>
        )}

        {/* Stat cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:5,marginBottom:10}}>
          {[
            ['Lease Start',p.leaseStart],
            ['Expiry',expiry],
            ['Yrs Left',expiry-CY>0?(expiry-CY)+' yrs':'Expired'],
            ['Acq. Cost',p.acqCr?'₹'+p.acqCr+' Cr':'—'],
            ['Jantri Val',row.pv?'₹'+row.pv.toLocaleString('en-IN')+'/sqm':'—'],
            ['Eff. Rent ('+CY+')',fmtCr(ex)],
          ].map(function(item){return(
            <div key={item[0]} style={{background:'#f9fafb',borderRadius:6,padding:'5px 8px'}}>
              <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{item[0]}</p>
              <p style={{fontSize:11,fontWeight:600,margin:'2px 0 0',color:'#111'}}>{item[1]}</p>
            </div>
          );})}
        </div>

        {/* Post-expiry proposed rates box for active LPA */}
        {isActiveLpa&&(
          <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:6,padding:'8px 12px',marginBottom:10}}>
            <p style={{fontSize:10,fontWeight:700,color:'#14532d',margin:'0 0 6px'}}>
              Post-Expiry Year-1 Proposed Rates (from {expiry}) — Used in IRR computation
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
              {SCEN_KEYS.map(function(k){
                const sm2=SCEN_META[k];
                const pct=ex>0?(((postExpiryRents[k]-ex)/ex)*100).toFixed(0):'—';
                return(
                  <div key={k} style={{background:'#fff',borderRadius:4,padding:'4px 8px',border:'1px solid #bbf7d0'}}>
                    <span style={badge(sm2.color,sm2.bg)}>{sm2.short}</span>
                    <p style={{fontSize:11,fontWeight:600,margin:'2px 0 0',color:'#111'}}>{fmtCr(postExpiryRents[k])}</p>
                    <p style={{fontSize:9,color:postExpiryRents[k]>=ex?'#065f46':'#991b1b',margin:0}}>vs today: {pct!=='—'?(Number(pct)>=0?'+':'')+pct+'%':'—'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* IRR methodology note */}
        <div style={{background:'#fffbeb',border:'1px solid #fbbf24',borderRadius:6,padding:'6px 10px',marginBottom:10,fontSize:9,color:'#92400e',lineHeight:1.6}}>
          <strong>IRR Methodology:</strong> Investment = acquisition cost (Actual) or Jantri×area (Revalued).
          {isActiveLpa
            ?` Cash flows: LPA rent escalating at ${(lpaEsc*100).toFixed(1)}% p.a. contractually during remaining lease → post-expiry scenario rate escalated at ${(g*100).toFixed(2)}% p.a.`
            :` Cash flows: existing rent during remaining lease → proposed scenario rent escalated at ${(g*100).toFixed(2)}% p.a. post-expiry.`
          } Plus residual at horizon end. IRR prospective from {CY}.
        </div>

        {/* Full Impact Table */}
        <p style={{fontSize:11,fontWeight:700,color:'#374151',marginBottom:4}}>Full Impact — All 8 Policy Scenarios</p>
        <div style={{overflowX:'auto',marginBottom:12}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10,minWidth:isActiveLpa?780:640}}>
            <thead>
              <tr>
                {['Scenario','Proposed ₹ (Curr. Period)',isActiveLpa?'Post-Expiry ₹':null,'Change ₹','% Chg','Times','IRR(Actual)','IRR(Reval)']
                  .filter(Boolean).map(function(h){return <th key={h} style={{...TH,textAlign:h==='Scenario'?'left':'right'}}>{h}</th>;})}
              </tr>
            </thead>
            <tbody>
              {SCEN_KEYS.map(function(k){
                const sm2=SCEN_META[k],r=rents[k],ir=irrs[k],diff=r-ex,isPos=diff>=0;
                return(
                  <tr key={k} style={{background:k==='opt6'?'#f0fdf4':'#fff'}}>
                    <td style={TD}><span style={badge(sm2.color,sm2.bg)}>{sm2.short}</span>{sm2.rec&&<span style={{fontSize:8,color:'#14532d',marginLeft:4,fontWeight:700}}>★ REC</span>}</td>
                    <td style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:600,color:isActiveLpa?'#6b7280':'#111'}}>{fmtCr(r)}</td>
                    {isActiveLpa&&<td style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:700,color:'#14532d'}}>{fmtCr(postExpiryRents[k])}</td>}
                    <td style={{...TD,textAlign:'right',color:isActiveLpa?'#9ca3af':isPos?'#065f46':'#991b1b',fontWeight:600}}>{isActiveLpa?'—':((diff>=0?'+':'')+fmtCr(Math.abs(diff)))}</td>
                    <td style={{...TD,textAlign:'right',fontWeight:700,color:isActiveLpa?'#9ca3af':isPos?'#065f46':'#991b1b'}}>{isActiveLpa?'—':fmtChg(r,ex)}</td>
                    <td style={{...TD,textAlign:'right'}}>{isActiveLpa?'—':fmtMx(r,ex)}</td>
                    <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:ir&&ir.actual>0.08?'#065f46':'#92400e'}}>{fmtPct(ir?ir.actual:null)}</td>
                    <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:ir&&ir.rev>0.04?'#065f46':'#6b7280'}}>{fmtPct(ir?ir.rev:null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isActiveLpa&&<p style={{fontSize:9,color:'#9ca3af',margin:'4px 0 0'}}>* Change & % columns blank during active lease (rates contractually locked). IRR reflects prospective return using post-expiry rates.</p>}
        </div>

        {/* 30-Year Projection toggle */}
        <div style={{marginBottom:8}}>
          <button onClick={function(){setShowProj(function(v){return!v;});}} style={{...btnS(showProj,'#1e40af'),fontSize:11,padding:'5px 12px'}}>
            {showProj?'▲ Hide':'▼ Show'} 30-Year Revenue Projection
          </button>
        </div>

        {showProj&&(
          <div>
            <p style={{fontSize:10,fontWeight:700,color:'#374151',margin:'0 0 2px'}}>30-Year Revenue Projection — Year-by-Year</p>
            <p style={{fontSize:9,color:'#9ca3af',margin:'0 0 8px',lineHeight:1.5}}>
              {isActiveLpa
                ?`During active lease (until ${expiry}): LPA rent escalates contractually at ${(lpaEsc*100).toFixed(1)}% p.a. Post-expiry: scenario rates escalated at policy rate.`
                :`During remaining lease: existing rent flat. Post-expiry: scenario rates escalated per policy.`}
              {' '}SoPC Cur/Rev uses WPI @{ctrl?ctrl.sopcProjWpi:5}% for post-expiry growth. Opt 1–6 uses {(g*100).toFixed(2)}% p.a.
            </p>
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'collapse',fontSize:9,minWidth:960}}>
                <thead>
                  <tr>
                    <th style={{...TH,minWidth:38}}>Yr</th>
                    <th style={{...TH,minWidth:42}}>Phase</th>
                    <th style={{...TH,minWidth:72,textAlign:'right',background:'#eff6ff',color:'#1e40af'}}>Existing</th>
                    {SCEN_KEYS.map(function(k){return<th key={k} style={{...TH,minWidth:68,textAlign:'right',background:SCEN_META[k].bg,color:SCEN_META[k].color}}>{SCEN_META[k].short}</th>;})}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:projYears},function(_,i){
                    const yr=CY+1+i,y=i+1;
                    const yToExp=Math.max(0,expiry-CY);
                    const inLease=y<=yToExp;
                    const bg=i%2===0?'#fafafa':'#fff';
                    return(
                      <tr key={yr} style={{background:inLease?'#f0f9ff':bg}}>
                        <td style={{...TD,fontWeight:600,color:'#374151'}}>{yr}</td>
                        <td style={{...TD,textAlign:'center',fontSize:8}}>
                          <span style={badge(inLease?'#1e40af':'#065f46',inLease?'#dbeafe':'#d1fae5')}>{inLease?'Lease':'Post-Exp'}</span>
                        </td>
                        <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:'#1e40af',background:'#eff6ff',fontWeight:500}}>{fmtCr(projExisting[i])}</td>
                        {SCEN_KEYS.map(function(k){
                          const v=projByScen[k][i],isPos=v>=projExisting[i];
                          return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',
                            background:SCEN_META[k].bg+'22',
                            color:inLease?'#6b7280':isPos?'#065f46':'#991b1b'}}>{fmtCr(v)}</td>;
                        })}
                      </tr>
                    );
                  })}
                  <tr style={{background:'#1e3a8a'}}>
                    <td colSpan={2} style={{...TD,color:'#93c5fd',fontSize:9,fontWeight:700}}>30-Yr Cumul.</td>
                    <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:'#fff',fontWeight:700,background:'#1e3a8a'}}>{fmtCr(projExisting.reduce(function(s,v){return s+v;},0))}</td>
                    {SCEN_KEYS.map(function(k){
                      const cum=projByScen[k].reduce(function(s,v){return s+v;},0);
                      const base=projExisting.reduce(function(s,v){return s+v;},0);
                      return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:700,
                        color:cum>=base?'#bbf7d0':'#fca5a5',background:'#1e3a8a'}}>{fmtCr(cum)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {p.notes&&<p style={{fontSize:10,color:'#6b7280',marginTop:8,padding:'4px 8px',background:'#f9fafb',borderRadius:4}}>📝 {p.notes}</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════ REVENUE OVERVIEW ══════════════════════
function RevenueOverview({computed,bifurc,ctrl}){
  const [selScen,setSelScen]=useState('opt6');
  const [showProj,setShowProj]=useState(false);
  const projYears=30;

  // FIX 2+3: Accurate per-plot aggregate 30-yr projection
  const aggProj=useMemo(function(){
    const g=getAnnGrowth(ctrl);
    const sopcWpi=ctrl.sopcProjWpi/100;
    const lpaRate=getLpaEscGrowth(ctrl);
    const result={};
    SCEN_KEYS.forEach(function(k){
      const gK=(k==='sopc_cur'||k==='sopc_rev')?sopcWpi:g;
      result[k]=Array.from({length:projYears},function(_,yi){
        return computed.reduce(function(sum,row){
          const yToExp=Math.max(0,row.p.expiry-CY);
          if(yi<yToExp){
            // FIX 3: During active lease — LPA escalates; SoPC/others flat; FIX 1: escalated existing used
            const r=row.p.landType==='lpa'?row.existing*Math.pow(1+lpaRate,yi+1):row.existing;
            return sum+r;
          }
          // FIX 2: Post-expiry escalated at scenario-specific rate
          return sum+row.postExpiryRents[k]*Math.pow(1+gK,yi-yToExp);
        },0);
      });
    });
    // Existing baseline (flat for SoPC; escalating for LPA during lease)
    result.existing=Array.from({length:projYears},function(_,yi){
      return computed.reduce(function(sum,row){
        const yToExp=Math.max(0,row.p.expiry-CY);
        if(row.p.landType==='lpa'){
          const y=yi+1;
          if(y<=yToExp)return sum+row.existing*Math.pow(1+lpaRate,y);
          return sum+row.existing*Math.pow(1+lpaRate,yToExp);
        }
        return sum+row.existing;
      },0);
    });
    return result;
  },[computed,ctrl]);

  const existingTotal=bifurc.total?bifurc.total.existing:0;
  const selRev=bifurc.total?bifurc.total[selScen]:0;
  const delta=selRev-existingTotal;
  const recInscen=bifurc.recommended||{};
  const isRec=SCEN_META[selScen]&&SCEN_META[selScen].rec;

  const topGain=useMemo(function(){
    return computed.slice().sort(function(a,b){return(b.rents[selScen]-b.existing)-(a.rents[selScen]-a.existing);}).slice(0,5);
  },[computed,selScen]);
  const topLoss=useMemo(function(){
    return computed.slice().sort(function(a,b){return(a.rents[selScen]-a.existing)-(b.rents[selScen]-b.existing);}).slice(0,5);
  },[computed,selScen]);

  function cumSum(arr){let s=0;return arr.map(function(v){s+=v;return s;});}

  if(!bifurc.total)return null;
  return(
    <div style={{padding:'12px 16px',overflowY:'auto',flex:1}}>
      {/* Scenario selector */}
      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12,alignItems:'center'}}>
        <span style={{fontSize:10,fontWeight:700,color:'#6b7280',marginRight:4}}>Compare Scenario:</span>
        {SCEN_KEYS.map(function(k){const m=SCEN_META[k];return(
          <button key={k} onClick={function(){setSelScen(k);}} style={{...btnS(selScen===k,m.color),fontSize:10,padding:'4px 10px',border:m.rec&&selScen!==k?'2px solid '+m.color:'none'}}>{m.short}</button>
        );})}
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
        {[
          {l:'Total Plots',v:computed.length,sub:'across '+PORT_NAMES.length+' ports',c:'#1e40af'},
          {l:'Existing Annual Rev.',v:fmtCr(existingTotal),sub:'FY '+CY+' baseline',c:'#374151'},
          {l:SCEN_META[selScen].short+' Annual Rev.',v:fmtCr(selRev),sub:isRec?'★ Recommended':'Scenario total',c:SCEN_META[selScen].color},
          {l:'Δ Revenue Impact',v:(delta>=0?'+':'')+fmtCr(delta),sub:fmtChg(selRev,existingTotal)+' change',c:delta>=0?'#065f46':'#991b1b'},
        ].map(function(c){return(
          <div key={c.l} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:'10px 12px',boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{c.l}</p>
            <p style={{fontSize:18,fontWeight:800,color:c.c,margin:'3px 0 1px'}}>{c.v}</p>
            <p style={{fontSize:9,color:'#6b7280',margin:0}}>{c.sub}</p>
          </div>
        );})}
      </div>

      {/* Revenue bifurcation table */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,marginBottom:14,overflow:'hidden'}}>
        <div style={{padding:'8px 12px',borderBottom:'1px solid #e5e7eb',background:'#f9fafb'}}>
          <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:0}}>Annual Revenue Bifurcation — All Scenarios (₹ Cr)</p>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
            <thead>
              <tr>
                <th style={{...TH,minWidth:100}}>Land Type / Port</th>
                <th style={{...TH,minWidth:70,textAlign:'right',color:'#1e40af'}}>Existing</th>
                {SCEN_KEYS.map(function(k){return<th key={k} style={{...TH,minWidth:72,textAlign:'right',color:SCEN_META[k].color,background:SCEN_META[k].bg}}>{SCEN_META[k].short}</th>;})}
              </tr>
            </thead>
            <tbody>
              {[['SoPC Ordinary','sopc'],['LPA Firm Land','lpa'],['Reclaimed','recl']].map(function(lt){
                const rw=bifurc[lt[1]];if(!rw)return null;
                return(
                  <tr key={lt[0]} style={{background:'#fff'}}>
                    <td style={TD}><span style={badge(TYPE_META[lt[1]==='sopc'?'sopc':lt[1]==='lpa'?'lpa':'reclaimed_pre2018'].color,TYPE_META[lt[1]==='sopc'?'sopc':lt[1]==='lpa'?'lpa':'reclaimed_pre2018'].bg)}>{lt[0]}</span></td>
                    <td style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:500}}>{fmtCr(rw.existing)}</td>
                    {SCEN_KEYS.map(function(k){const v=rw[k],isPos=v>=rw.existing;return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',color:isPos?'#065f46':'#991b1b'}}>{fmtCr(v)}</td>;})}
                  </tr>
                );
              })}
              <tr style={{background:'#1e3a8a'}}>
                <td style={{...TD,color:'#93c5fd',fontWeight:700}}>TOTAL</td>
                <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:'#fff',fontWeight:700}}>{fmtCr(bifurc.total.existing)}</td>
                {SCEN_KEYS.map(function(k){const v=bifurc.total[k],isPos=v>=bifurc.total.existing;return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:700,color:isPos?'#bbf7d0':'#fca5a5'}}>{fmtCr(v)}</td>;})}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Top gainers / losers */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        {[{title:'Top Revenue Gainers',list:topGain,pos:true},{title:'Top Revenue Impact (Low/Negative)',list:topLoss,pos:false}].map(function(sec){return(
          <div key={sec.title} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
            <div style={{padding:'7px 12px',borderBottom:'1px solid #e5e7eb',background:sec.pos?'#f0fdf4':'#fff7f7'}}>
              <p style={{fontSize:10,fontWeight:700,color:sec.pos?'#065f46':'#991b1b',margin:0}}>{sec.title}</p>
              <p style={{fontSize:9,color:'#9ca3af',margin:0}}>{SCEN_META[selScen].label}</p>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
              <tbody>
                {sec.list.map(function(row){
                  const diff=row.rents[selScen]-row.existing,isLpaLock=row.isActiveLpa;
                  return(
                    <tr key={row.p.id}>
                      <td style={{...TD,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:9}}>{row.p.name}</td>
                      <td style={{...TD,textAlign:'right',color:diff>=0?'#065f46':'#991b1b',fontWeight:700,fontSize:10,fontFamily:'monospace'}}>{isLpaLock?'Locked':(diff>=0?'+':'')+fmtCr(diff)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );})}
      </div>

      {/* 30-Year Aggregate Projection */}
      <div style={{marginBottom:10}}>
        <button onClick={function(){setShowProj(function(v){return!v;});}} style={{...btnS(showProj,'#1e40af'),fontSize:11,padding:'5px 12px',marginBottom:showProj?8:0}}>
          {showProj?'▲ Hide':'▼ Show'} 30-Year Aggregate Revenue Projection
        </button>
        {showProj&&(
          <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,overflow:'hidden'}}>
            <div style={{padding:'7px 12px',borderBottom:'1px solid #e5e7eb',background:'#f9fafb',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <p style={{fontSize:11,fontWeight:700,color:'#374151',margin:0}}>30-Year Portfolio Revenue Projection (₹ Cr)</p>
              <p style={{fontSize:9,color:'#9ca3af',margin:0}}>
                SoPC Cur/Rev: WPI @{ctrl.sopcProjWpi}% · Opt 1–6: {(getAnnGrowth(ctrl)*100).toFixed(2)}% p.a. · LPA lease-lock until expiry
              </p>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{borderCollapse:'collapse',fontSize:9,width:'100%',minWidth:900}}>
                <thead>
                  <tr>
                    <th style={{...TH,minWidth:38}}>Yr</th>
                    <th style={{...TH,minWidth:72,textAlign:'right',background:'#eff6ff',color:'#1e40af'}}>Existing</th>
                    {SCEN_KEYS.map(function(k){return<th key={k} style={{...TH,minWidth:70,textAlign:'right',background:SCEN_META[k].bg,color:SCEN_META[k].color}}>{SCEN_META[k].short}</th>;})}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({length:projYears},function(_,i){
                    const yr=CY+1+i,bg=i%2===0?'#fafafa':'#fff';
                    return(
                      <tr key={yr} style={{background:bg}}>
                        <td style={{...TD,fontWeight:600,color:'#374151'}}>{yr}</td>
                        <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:'#1e40af',background:'#eff6ff',fontWeight:500}}>{fmtCr(aggProj.existing[i])}</td>
                        {SCEN_KEYS.map(function(k){
                          const v=aggProj[k][i],isPos=v>=aggProj.existing[i];
                          return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',background:SCEN_META[k].bg+'22',color:isPos?'#065f46':'#991b1b'}}>{fmtCr(v)}</td>;
                        })}
                      </tr>
                    );
                  })}
                  <tr style={{background:'#1e3a8a'}}>
                    <td style={{...TD,color:'#93c5fd',fontWeight:700,fontSize:8}}>30-Yr Cumul.</td>
                    <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:'#fff',fontWeight:700,background:'#1e3a8a'}}>{fmtCr(aggProj.existing.reduce(function(s,v){return s+v;},0))}</td>
                    {SCEN_KEYS.map(function(k){
                      const cum=aggProj[k].reduce(function(s,v){return s+v;},0);
                      const base=aggProj.existing.reduce(function(s,v){return s+v;},0);
                      return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:700,color:cum>=base?'#bbf7d0':'#fca5a5',background:'#1e3a8a'}}>{fmtCr(cum)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════ DETAILED MATRIX ══════════════════════
function DetailedMatrix({computed,onRowClick,ctrl}){
  const [selPort,setSelPort]=useState('All');
  const [selType,setSelType]=useState('All');
  const [selStatus,setSelStatus]=useState('All');
  const [sortK,setSortK]=useState('existing');
  const [sortD,setSortD]=useState(-1);
  const [page,setPage]=useState(0);
  const PER=30;

  const filtered=useMemo(function(){
    return computed.filter(function(r){
      if(selPort!=='All'&&r.p.port!==selPort)return false;
      if(selType!=='All'&&r.p.landType!==selType)return false;
      if(selStatus!=='All'&&r.p.status!==selStatus)return false;
      return true;
    }).sort(function(a,b){
      let av=a[sortK]!==undefined?a[sortK]:(a.rents&&a.rents[sortK]!==undefined?a.rents[sortK]:0);
      let bv=b[sortK]!==undefined?b[sortK]:(b.rents&&b.rents[sortK]!==undefined?b.rents[sortK]:0);
      if(sortK==='name')return sortD*(av<bv?-1:1);
      return sortD*(bv-av);
    });
  },[computed,selPort,selType,selStatus,sortK,sortD]);

  const paged=filtered.slice(page*PER,(page+1)*PER);
  const totPages=Math.ceil(filtered.length/PER);
  function sort(k){if(sortK===k)setSortD(function(d){return-d;});else{setSortK(k);setSortD(-1);}setPage(0);}
  function SH({k,children}){return<th onClick={function(){sort(k);}} style={{...TH,cursor:'pointer',userSelect:'none'}}>{children}{sortK===k?(sortD>0?'▲':'▼'):''}</th>;}

  return(
    <div style={{padding:'12px 16px',overflowY:'auto',flex:1}}>
      {/* Filters */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
        <span style={{fontSize:10,fontWeight:700,color:'#6b7280'}}>Filter:</span>
        <select style={SEL} value={selPort} onChange={function(e){setSelPort(e.target.value);setPage(0);}}>
          <option>All</option>{PORT_NAMES.map(function(p){return<option key={p}>{p}</option>;})}
        </select>
        <select style={SEL} value={selType} onChange={function(e){setSelType(e.target.value);setPage(0);}}>
          <option value="All">All Types</option>
          {Object.entries(TYPE_META).map(function(e){return<option key={e[0]} value={e[0]}>{e[1].label}</option>;})}
        </select>
        <select style={SEL} value={selStatus} onChange={function(e){setSelStatus(e.target.value);setPage(0);}}>
          <option value="All">All Status</option>
          {Object.entries(STATUS_META).map(function(e){return<option key={e[0]} value={e[0]}>{e[1].label}</option>;})}
        </select>
        <span style={{fontSize:10,color:'#9ca3af',marginLeft:'auto'}}>{filtered.length} plots · page {page+1}/{totPages}</span>
        <div style={{display:'flex',gap:4}}>
          <button onClick={function(){setPage(function(p){return Math.max(0,p-1);});}} disabled={page===0} style={btnS(false)}>‹</button>
          <button onClick={function(){setPage(function(p){return Math.min(totPages-1,p+1);});}} disabled={page>=totPages-1} style={btnS(false)}>›</button>
        </div>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:10}}>
          <thead>
            <tr>
              <SH k="name">Plot / Lessee</SH>
              <SH k="port">Port</SH>
              <th style={TH}>Type</th>
              <th style={TH}>Status</th>
              <SH k="area">Area</SH>
              <SH k="existing">Existing ₹</SH>
              {SCEN_KEYS.map(function(k){return<SH key={k} k={k}>{SCEN_META[k].short}</SH>;})}
              <th style={TH}>IRR Opt6 (A)</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(function(row){
              const p=row.p,ex=row.existing;
              const tm=TYPE_META[p.landType]||TYPE_META.sopc;
              const sm=STATUS_META[p.status]||STATUS_META.active;
              const ir6=row.irrs&&row.irrs.opt6?row.irrs.opt6.actual:null;
              return(
                <tr key={p.id} onClick={function(){onRowClick(row);}} style={{cursor:'pointer',background:'#fff'}} onMouseEnter={function(e){e.currentTarget.style.background='#f0f9ff';}} onMouseLeave={function(e){e.currentTarget.style.background='#fff';}}>
                  <td style={{...TD,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:10}}>
                    {p.name}
                    {row.isActiveLpa&&<span style={{fontSize:8,color:'#6d28d9',marginLeft:4,fontWeight:700}}>🔒LPA</span>}
                  </td>
                  <td style={{...TD,fontSize:9}}>{p.port}</td>
                  <td style={TD}><span style={badge(tm.color,tm.bg)}>{tm.label.split(' ')[0]}</span></td>
                  <td style={TD}><span style={badge(sm.color,sm.bg)}>{sm.label}</span></td>
                  <td style={{...TD,textAlign:'right',fontFamily:'monospace'}}>{fmtA(p.area)}</td>
                  <td style={{...TD,textAlign:'right',fontFamily:'monospace',fontWeight:600,color:'#1e40af'}}>{fmtCr(ex)}</td>
                  {SCEN_KEYS.map(function(k){
                    const v=row.rents[k],isPos=v>=ex,isLock=row.isActiveLpa;
                    return<td key={k} style={{...TD,textAlign:'right',fontFamily:'monospace',
                      color:isLock?'#6b7280':isPos?'#065f46':'#991b1b',
                      fontWeight:k==='opt6'?700:400,
                      background:k==='opt6'?'#f0fdf4':'transparent'}}>{fmtCr(v)}{isLock&&k==='opt6'&&<span style={{fontSize:7,marginLeft:2}}>🔒</span>}</td>;
                  })}
                  <td style={{...TD,textAlign:'right',fontFamily:'monospace',color:ir6&&ir6>0.08?'#065f46':'#92400e'}}>{fmtPct(ir6)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════ PASSWORD GATE ════════════════════════
function PasswordGate({onUnlock}){
  const [pw,setPw]=useState('');const [err,setErr]=useState(false);
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%)'}}>
      <div style={{background:'rgba(255,255,255,0.97)',borderRadius:16,padding:'2.5rem 2rem',width:340,boxShadow:'0 24px 64px rgba(0,0,0,0.25)',textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:12}}>⚓</div>
        <p style={{fontSize:18,fontWeight:800,color:'#1e40af',margin:'0 0 4px'}}>GMB Land Policy</p>
        <p style={{fontSize:12,color:'#6b7280',margin:'0 0 24px'}}>Revenue Impact Dashboard · Restricted Access</p>
        <input type="password" placeholder="Enter access code" value={pw}
          style={{width:'100%',boxSizing:'border-box',padding:'10px 14px',borderRadius:8,border:err?'2px solid #ef4444':'2px solid #e5e7eb',fontSize:13,outline:'none',marginBottom:12,textAlign:'center',letterSpacing:3}}
          onChange={function(e){setPw(e.target.value);setErr(false);}}
          onKeyDown={function(e){if(e.key==='Enter'){if(pw==='gmb2026')onUnlock();else setErr(true);}}}/>
        {err&&<p style={{fontSize:11,color:'#ef4444',margin:'-8px 0 8px'}}>Invalid access code</p>}
        <button onClick={function(){if(pw==='gmb2026')onUnlock();else setErr(true);}}
          style={{width:'100%',padding:'10px',background:'#1e40af',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
          Access Dashboard
        </button>
        <p style={{fontSize:9,color:'#d1d5db',marginTop:16}}>Gujarat Maritime Board · PVT Cell · Confidential</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════ APP ══════════════════════════════════
export default function App(){
  const [unlocked,setUnlocked]=useState(false);
  const [plots,setPlots]=useState(INIT_PLOTS);
  const [ctrl,setCtrl]=useState(DEF_CTRL);
  const [tab,setTab]=useState('overview');
  const [detail,setDetail]=useState(null);
  const [editP,setEditP]=useState(null);
  const [isNew,setIsNew]=useState(false);
  const [saving,setSaving]=useState(false);
  const [loadMsg,setLoadMsg]=useState(null);
  const [dirty,setDirty]=useState(false);

  // ── Load from JSONBin on unlock ──────────────────────────────────────────
  useEffect(function(){
    if(!unlocked||!CONFIGURED)return;
    setLoadMsg('Loading saved data…');
    fetch(BIN_URL+'/latest',{headers:HDR_READ})
      .then(function(r){return r.json();})
      .then(function(data){
        // Support both full-plots legacy format and new delta format
        if(data&&data.ctrl)setCtrl(function(prev){return Object.assign({},DEF_CTRL,data.ctrl);});
        if(data&&data.delta){
          const loaded=applyDelta(data.delta);
          // Update _id to avoid collision
          loaded.forEach(function(p){if(p.id>=_id)_id=p.id+1;});
          setPlots(loaded);
          setLoadMsg('✓ Saved data loaded (delta)');
        } else if(data&&data.plots&&Array.isArray(data.plots)){
          // Legacy: full plots array
          setPlots(data.plots);
          setLoadMsg('✓ Saved data loaded (legacy)');
        } else {
          setLoadMsg('✓ Using default data');
        }
        setTimeout(function(){setLoadMsg(null);},3000);
      })
      .catch(function(){setLoadMsg('⚠ Could not load — using defaults');setTimeout(function(){setLoadMsg(null);},4000);});
  },[unlocked]);

  // ── Save to JSONBin (delta format) ───────────────────────────────────────
  const saveToCloud=useCallback(function(){
    if(!CONFIGURED)return;
    setSaving(true);
    const delta=computeDelta(plots);
    const payload={ctrl,delta,savedAt:new Date().toISOString(),v:'delta-v2'};
    fetch(BIN_URL,{method:'PUT',headers:HDR_WRITE,body:JSON.stringify(payload)})
      .then(function(){setSaving(false);setDirty(false);setLoadMsg('✓ Saved');setTimeout(function(){setLoadMsg(null);},2500);})
      .catch(function(){setSaving(false);setLoadMsg('✗ Save failed');setTimeout(function(){setLoadMsg(null);},3000);});
  },[plots,ctrl]);

  // ── Compute engine ───────────────────────────────────────────────────────
  const computed=useMemo(function(){
    const g=getAnnGrowth(ctrl);
    const fp=getFreshPct(ctrl);
    const lpaEscRate=getLpaEscGrowth(ctrl); // FIX 1: LPA escalation rate

    return plots.map(function(p){
      const pv=p.indivVal||ctrl.portVals[p.port]||3000;
      const acqPsqm=p.acqValPsqm||ctrl.portAcq[p.port]||300;
      const invA=p.acqCr>0?p.acqCr*1e7:p.area*acqPsqm;
      const invR=p.area*pv;
      const slFact=margF(p.area,ctrl.slabBounds,ctrl.slabPcts)/100;
      const uf=ctrl.slabUF[slabI(p.area,ctrl.slabBounds)]/100;
      const expiry=(p.leaseStart||CY)+(p.leaseTerm||30);
      const yearsLeft=expiry-CY;
      const status=yearsLeft>5?'active':yearsLeft>0?'expiring':'expired';
      const isRec=p.landType==='reclaimed_pre2018'||p.landType==='reclaimed_post2018';
      const reclF=isRec?ctrl.reclPct/100:1;
      const rebate=isRec&&p.recYear&&(CY-p.recYear)<ctrl.rebateYrs;
      const effReclF=rebate?reclF*(ctrl.rebateDiscount/100):reclF;

      // FIX 1: For LPA plots, escalate base rent from allotment year to CY
      const isLpa=p.landType==='lpa';
      const yearsElapsed=isLpa?Math.max(0,Math.min(CY-(p.leaseStart||CY),p.leaseTerm||30)):0;
      const effectiveRent=isLpa?p.currentRent*Math.pow(1+lpaEscRate,yearsElapsed):p.currentRent;
      const baseEx=effectiveRent;
      const existing=(ctrl.holdoverOn&&status==='expired')?baseEx*ctrl.penaltyMult:baseEx;

      // FIX 3: Is this an active LPA (contractually locked)?
      const isActiveLpa=isLpa&&yearsLeft>0;

      // Raw scenario rent (pure policy calculation — applies post-expiry for LPA)
      function rawScen(k){
        if(k==='sopc_cur')return(p.area/10)*ctrl.sopcCurRate;
        if(k==='sopc_rev')return(p.area/10)*ctrl.sopcRevRate;
        if(k==='opt1')return p.area*pv*(fp/100)*slFact*uf;
        if(k==='opt2')return p.area*pv*0.40*(fp/100)*slFact*uf;
        if(k==='opt3')return baseEx;
        if(k==='opt4')return baseEx*(1+ctrl.wpiRate/100);
        if(k==='opt5')return baseEx*1.5;
        if(k==='opt6')return baseEx*(1+ctrl.blockPct/100);
        return baseEx;
      }

      const rents={};
      const postExpiryRents={}; // always the pure scenario calculation (for IRR + projection)
      SCEN_KEYS.forEach(function(k){
        const raw=rawScen(k)*effReclF;
        postExpiryRents[k]=raw;
        // FIX 3: Active LPA => revenue = existing (contractually locked); others => scenario
        rents[k]=isActiveLpa?existing:raw;
      });

      const resA=invA*(ctrl.residualPct/100),resR=invR*(ctrl.residualPct/100);
      const irrs={};
      // IRR always uses postExpiryRents as yr1 (prospective: what GMB will charge post-expiry)
      // During remaining lease: LPA rent escalates contractually; SoPC flat
      const lpaEsc=isLpa?lpaEscRate:0;
      SCEN_KEYS.forEach(function(k){
        const yr1=postExpiryRents[k];
        const cfsA=buildCFs(invA,yr1,g,ctrl.irrHorizon,resA,expiry,existing,lpaEsc);
        const cfsR=buildCFs(invR,yr1,g,ctrl.irrHorizon,resR,expiry,existing,lpaEsc);
        irrs[k]={actual:cfsA?calcIRR(cfsA):null,rev:cfsR?calcIRR(cfsR):null};
      });

      return{p:Object.assign({},p,{status,expiry,yearsLeft}),pv,acqPsqm,existing,rents,postExpiryRents,irrs,isRec,effReclF,isActiveLpa};
    });
  },[plots,ctrl]);

  // ── Bifurcation aggregate ────────────────────────────────────────────────
  const bifurc=useMemo(function(){
    const mk=function(){const o={existing:0};SCEN_KEYS.forEach(function(k){o[k]=0;});return o;};
    const sopc=mk(),lpa=mk(),recl=mk(),total=mk(),recommended=mk();
    computed.forEach(function(row){
      const target=row.p.landType==='sopc'?sopc:row.p.landType==='lpa'?lpa:recl;
      target.existing+=row.existing;total.existing+=row.existing;
      SCEN_KEYS.forEach(function(k){target[k]+=row.rents[k];total[k]+=row.rents[k];});
    });
    SCEN_KEYS.forEach(function(k){if(SCEN_META[k].rec)SCEN_KEYS.forEach(function(k2){recommended[k2]=total[k];});});
    return{sopc,lpa,recl,total,recommended};
  },[computed]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const savePlot=function(v){
    setPlots(function(prev){
      if(isNew){const np={...v,id:_id++};return[...prev,np];}
      return prev.map(function(p){return p.id===v.id?{...v}:p;});
    });
    setEditP(null);setDirty(true);
  };
  const deletePlot=function(id){setPlots(function(prev){return prev.filter(function(p){return p.id!==id;});});setEditP(null);setDirty(true);};
  const openAdd=function(){setIsNew(true);setEditP({id:null,name:'New Plot',port:'Alang',portIdx:0,pgIdx:0,landType:'sopc',area:1000,currentRent:0,leaseStart:CY,leaseTerm:10,acqCr:0,indivVal:null,acqValPsqm:null,recYear:null,notes:''});};

  if(!unlocked)return<PasswordGate onUnlock={function(){setUnlocked(true);}}/>;

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100vh',fontFamily:"'Segoe UI',system-ui,sans-serif",background:'#f1f5f9'}}>
      {/* Top bar */}
      <div style={{background:'#1e3a8a',color:'#fff',padding:'0 16px',display:'flex',alignItems:'center',gap:12,height:46,flexShrink:0,boxShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>
        <span style={{fontSize:20}}>⚓</span>
        <div>
          <p style={{fontSize:12,fontWeight:800,margin:0,letterSpacing:0.3}}>GMB Land Policy — Revenue Impact Dashboard</p>
          <p style={{fontSize:9,color:'#93c5fd',margin:0}}>Gujarat Maritime Board · PVT Cell · {plots.length} plots · FY {CY}</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:6,alignItems:'center'}}>
          {loadMsg&&<span style={{fontSize:10,color:'#bfdbfe',fontStyle:'italic'}}>{loadMsg}</span>}
          {dirty&&!saving&&<button onClick={saveToCloud} style={{...btnS(true,'#065f46'),fontSize:10,padding:'4px 10px'}}>💾 Save Changes</button>}
          {saving&&<span style={{fontSize:10,color:'#93c5fd'}}>Saving…</span>}
          <button onClick={openAdd} style={{...btnS(true,'#6d28d9'),fontSize:10,padding:'4px 10px'}}>+ Add Plot</button>
          <button onClick={saveToCloud} style={{...btnS(false),fontSize:10,padding:'4px 10px',color:'#fff',border:'1px solid #3b82f6',background:'transparent'}}>☁ Sync Cloud</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'0 16px',display:'flex',gap:0,flexShrink:0}}>
        {[['overview','📊 Revenue Overview'],['matrix','📋 Detailed Matrix']].map(function(t){return(
          <button key={t[0]} onClick={function(){setTab(t[0]);}} style={{padding:'8px 16px',border:'none',borderBottom:tab===t[0]?'3px solid #1e40af':'3px solid transparent',background:'none',fontSize:11,fontWeight:tab===t[0]?700:400,color:tab===t[0]?'#1e40af':'#6b7280',cursor:'pointer'}}>{t[1]}</button>
        );})}
      </div>

      {/* Main content */}
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        <ControlPanel c={ctrl} setC={function(v){setCtrl(v);setDirty(true);}}/>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {tab==='overview'&&<RevenueOverview computed={computed} bifurc={bifurc} ctrl={ctrl}/>}
          {tab==='matrix'&&<DetailedMatrix computed={computed} onRowClick={function(row){setDetail(row);}} ctrl={ctrl}/>}
        </div>
      </div>

      {/* Modals */}
      {detail&&(
        <RowDetail row={detail}
          onClose={function(){setDetail(null);}}
          onEdit={function(){setEditP(detail.p);setIsNew(false);setDetail(null);}}
          ctrl={ctrl}/>
      )}
      {editP&&(
        <PlotEditor plot={editP} isNew={isNew}
          onSave={savePlot}
          onDelete={deletePlot}
          onClose={function(){setEditP(null);}}/>
      )}
    </div>
  );
}
