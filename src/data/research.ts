export interface ResearchArticle {
  id: string;
  title: string;
  authors: string;
  journal: string;
  abstract: string;
  type: string;
  field: string;
  year: number;
  language: string;
  publisher: string;
  doi: string;
  pdfUrl?: string;
  relevanceScore: number;
  content?: string;
}

export const researchData: ResearchArticle[] = [
  {
    id: "R2026-ATMP1",
    title: "Efficacy of CAR-T Cell Therapy in Relapsed B-Cell Lymphoma: A Thai Multicenter Study",
    authors: "สมคิด ลี้ประเสริฐ, วิชัย กุลพัฒน์ และคณะ",
    journal: "Journal of Advanced Therapies (Thailand)",
    abstract: "การศึกษานี้ประเมินประสิทธิภาพของ CAR-T cell ในผู้ป่วย B-Cell Lymphoma ที่กลับเป็นซ้ำในประเทศไทย...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2026,
    language: "อังกฤษ",
    publisher: "สภาเภสัชกรรม",
    doi: "10.14456/jat.2026.01",
    relevanceScore: 100,
    content: "บทนำ\nChimeric Antigen Receptor (CAR) T-cell therapy เป็นหนึ่งในการรักษาแบบเซลล์บำบัด (ATMPs) ที่มีความก้าวหน้าที่สุดในการรักษามะเร็งเม็ดเลือดขาวและมะเร็งต่อมน้ำเหลืองที่กลับเป็นซ้ำหรือดื้อต่อการรักษา (relapsed/refractory). ในบริบทของประเทศไทย การเข้าถึง CAR-T cell ยังคงมีข้อจำกัดด้านต้นทุนและโครงสร้างพื้นฐาน การศึกษานี้เป็นการรวบรวมข้อมูลแบบ Multicenter เพื่อประเมินประสิทธิภาพและความปลอดภัยของ CAR-T cell ที่ผลิตในประเทศ (local manufacturing) เทียบกับที่นำเข้าจากต่างประเทศ.\n\nวิธีการศึกษา\nศึกษาแบบ Retrospective cohort ในผู้ป่วย Diffuse Large B-Cell Lymphoma (DLBCL) จำนวน 45 ราย ที่ได้รับ Tisagenlecleucel หรือ Axicabtagene ciloleucel ระหว่างปี 2024-2025 ในศูนย์การแพทย์ 3 แห่งในประเทศไทย โดยประเมินอัตราการตอบสนองโดยรวม (Overall Response Rate: ORR), อัตราการรอดชีวิตที่ปลอดโรค (Progression-Free Survival: PFS) และอุบัติการณ์ของภาวะแทรกซ้อน เช่น Cytokine Release Syndrome (CRS) และ ICANS.\n\nผลการศึกษา\nพบว่าผู้ป่วยมี ORR ที่ 82% และอัตราการตอบสนองสมบูรณ์ (Complete Response: CR) ที่ 54% ภายในระยะเวลา 6 เดือน. ภาวะแทรกซ้อนที่พบได้บ่อยคือ CRS ระดับ 1-2 (68%) ซึ่งสามารถจัดการได้ด้วย Tocilizumab และ Corticosteroids ตามแนวทางมาตรฐาน. มีผู้ป่วย 3 ราย (6.6%) ที่เกิด CRS ระดับ 3 ขึ้นไป และต้องเข้ารับการรักษาใน ICU. ข้อมูลทางเภสัชจลนศาสตร์แสดงให้เห็นการขยายตัวของเซลล์ CAR-T ในกระแสเลือดที่สูงสุดในวันที่ 14 หลังการให้ยา.\n\nวิจารณ์และสรุป\nการใช้ CAR-T cell therapy ในประเทศไทยให้ผลลัพธ์ที่มีประสิทธิภาพทัดเทียมกับข้อมูลในระดับสากล แม้จะมีความท้าทายในด้านโลจิสติกส์และการดูแลผู้ป่วยระยะยาว เภสัชกรผู้เชี่ยวชาญด้าน ATMPs มีบทบาทสำคัญอย่างยิ่งในการจัดการกระบวนการรับ-ส่งเซลล์ (Chain of Identity/Chain of Custody), การเตรียมความพร้อมของยาระงับปฏิกิริยา CRS และการติดตามอาการไม่พึงประสงค์ระยะยาว การผลักดันให้เกิดเครือข่ายความร่วมมือระหว่างโรงพยาบาล จะช่วยเพิ่มการเข้าถึงการรักษานี้ในประชากรไทยได้อย่างยั่งยืน."
  },
  {
    id: "R2026-ATMP2",
    title: "Pharmacoeconomic Evaluation of Gene Therapy for Spinal Muscular Atrophy in Thailand",
    authors: "อารยา สุจริต, ปิยะรัตน์ จงเจริญ",
    journal: "Thai Journal of Pharmacoeconomics",
    abstract: "การประเมินความคุ้มค่าทางเศรษฐศาสตร์สาธารณสุขของการให้ยีนบำบัด Onasemnogene abeparvovec ในผู้ป่วย SMA...",
    type: "บทความวิจัย",
    field: "เภสัชศาสตร์สังคมบริหาร",
    year: 2026,
    language: "อังกฤษ",
    publisher: "Thai Journal of Pharmacy Practice",
    doi: "10.14456/tjp.2026.04",
    relevanceScore: 99,
    content: "บทนำ\nSpinal Muscular Atrophy (SMA) เป็นโรคทางพันธุกรรมที่เกิดจากการกลายพันธุ์ของยีน SMN1 ส่งผลให้กล้ามเนื้ออ่อนแรงและเสียชีวิตในวัยเด็ก Onasemnogene abeparvovec เป็นยีนบำบัดแบบให้ครั้งเดียว (One-time ATMP) ที่มีราคาสูงมาก การศึกษานี้มุ่งประเมินความคุ้มค่าทางเศรษฐศาสตร์ (Cost-Effectiveness) ของยีนบำบัดเทียบกับการรักษาด้วย Nusinersen ซึ่งเป็นทางเลือกมาตรฐานในประเทศไทย.\n\nระเบียบวิธีวิจัย\nใช้แบบจำลอง Markov model ในมุมมองของระบบสาธารณสุขไทย (Healthcare perspective) โดยมีกรอบเวลาตลอดชีพ (Lifetime horizon) อัตราคิดลด (Discount rate) 3% ต่อปี ข้อมูลความน่าจะเป็นทางคลินิกอ้างอิงจากการทดลองทางคลินิกระยะที่ 3 และ Real-World Evidence ข้อมูลต้นทุนรวมถึงค่ายา ค่าเตรียมยา (ATMP handling costs) ค่ารักษาพยาบาลอื่นๆ และต้นทุนการสูญเสียผลิตภาพ (Indirect costs) ของผู้ดูแล.\n\nผลการศึกษา\nที่ระดับความพึงพอใจในการจ่าย (Willingness to Pay: WTP) ที่ 1.2 เท่าของ GNI per capita ต่อ 1 QALY (Quality-Adjusted Life Year) พบว่าการใช้ Onasemnogene abeparvovec มีอัตราส่วนต้นทุนประสิทธิผลส่วนเพิ่ม (ICER) อยู่ที่ 1,450,000 บาทต่อ QALY ซึ่งสูงกว่าเกณฑ์ที่กำหนด อย่างไรก็ตาม หากพิจารณาถึงต้นทุนทางอ้อมของผู้ดูแลที่ลดลง (Societal perspective) และการลดลงของราคายาในอนาคต (Price negotiation) โอกาสที่เทคโนโลยีนี้จะมีความคุ้มค่าจะเพิ่มขึ้นถึง 65% ในการวิเคราะห์ความไวแบบน่าจะเป็น (Probabilistic Sensitivity Analysis).\n\nสรุปผล\nในปัจจุบันยีนบำบัดสำหรับ SMA ยังมี ICER ที่เกินเกณฑ์การยอมรับของประเทศไทย แต่การจัดทำกลไกการจ่ายเงินแบบ Risk-Sharing Agreement หรือ Outcomes-Based Managed Entry Agreement (MEA) อาจเป็นทางออกที่ช่วยให้ผู้ป่วยเข้าถึงยา ATMPs กลุ่มนี้ได้ โดยที่รัฐหรือระบบประกันสุขภาพสามารถบริหารความเสี่ยงด้านงบประมาณได้อย่างมีประสิทธิภาพสูงสุด."
  },
  {
    id: "R2026-ATMP3",
    title: "Good Manufacturing Practice (GMP) Compliance Challenges for Point-of-Care ATMP Manufacturing",
    authors: "ธนาวุฒิ วิเศษสิงห์",
    journal: "Journal of Quality Assurance in Pharmacy",
    abstract: "ความท้าทายในการปฏิบัติตามมาตรฐาน GMP สำหรับการผลิตผลิตภัณฑ์การแพทย์ขั้นสูง ณ จุดดูแลผู้ป่วย (Point-of-Care)...",
    type: "บทความวิชาการ",
    field: "เภสัชกรรมโรงพยาบาล",
    year: 2025,
    language: "ไทย",
    publisher: "สภาเภสัชกรรม",
    doi: "10.14456/jqap.2025.11",
    relevanceScore: 98,
    content: "บทความวิชาการนี้กล่าวถึงแนวโน้มการกระจายศูนย์การผลิตผลิตภัณฑ์เซลล์และยีนบำบัด (ATMPs) จากโรงงานอุตสาหกรรมขนาดใหญ่มาสู่การผลิตภายในศูนย์การแพทย์เฉพาะทาง (Point-of-Care Manufacturing) เพื่อลดระยะเวลาการขนส่งและตอบสนองต่ออาการของผู้ป่วยได้อย่างรวดเร็ว\n\nความท้าทายหลัก:\n1. การควบคุมสภาพแวดล้อม (Environmental Monitoring): โรงพยาบาลส่วนใหญ่อาจมีข้อจำกัดในการปรับปรุงโครงสร้างพื้นฐานให้เป็น Cleanroom Grade B หรือ A ที่ได้มาตรฐาน PIC/S GMP สำหรับ ATMPs โดยเฉพาะ\n2. การรับรองบุคลากร (Personnel Qualification): เภสัชกรและนักวิทยาศาสตร์การแพทย์ที่ปฏิบัติงานจะต้องผ่านการอบรม Aseptic Technique ที่เข้มงวด และมีการประเมิน Media Fill อย่างต่อเนื่อง\n3. การบริหารความเสี่ยงด้านคุณภาพ (Quality Risk Management): การตรวจสอบการปนเปื้อนของผลิตภัณฑ์เซลล์สดที่ไม่สามารถผ่านการฆ่าเชื้อขั้นตอนสุดท้าย (Terminal sterilization) ได้ จำเป็นต้องพึ่งพา Rapid Microbial Methods ซึ่งมีต้นทุนสูง\n\nข้อเสนอแนะ:\nหน่วยงานกำกับดูแล (อย.) และสภาเภสัชกรรม ควรจัดทำคู่มือและ Guideline สอดคล้องกับ EU GMP Annex 2A เพื่อรองรับรูปแบบ Point-of-Care โดยมุ่งเน้นระบบปิด (Closed systems) และเทคโนโลยี Automation ที่สามารถทดแทนห้องสะอาดระดับสูงได้บางส่วน ซึ่งจะช่วยลดต้นทุนและยกระดับความปลอดภัยให้กับผู้ป่วยที่ต้องรับการรักษาด้วย ATMPs ในประเทศไทย."
  },
  {
    id: "R2026-ATMP4",
    title: "Precision Medicine using CRISPR-Cas9 Edited T-Cells: A Pharmacological Perspective",
    authors: "วรลักษณ์ สินธุ, ภควัต วิชัย",
    journal: "Asian Journal of Pharmacogenomics",
    abstract: "บทบาทของเภสัชกรในการจัดการและการใช้ CRISPR-Cas9 เพื่อตัดต่อพันธุกรรม T-Cells สำหรับการรักษาที่จำเพาะเจาะจง...",
    type: "รายงานการวิจัย",
    field: "เภสัชเวทและพิษวิทยา",
    year: 2025,
    language: "อังกฤษ",
    publisher: "อื่นๆ",
    doi: "10.14456/ajp.2025.03",
    relevanceScore: 97,
    content: "บทนำ\nเทคโนโลยี CRISPR-Cas9 ได้ปฏิวัติวงการแพทย์ในการแก้ไขข้อบกพร่องทางพันธุกรรมอย่างแม่นยำ งานวิจัยชิ้นนี้มุ่งเน้นการประยุกต์ใช้ CRISPR ในการตัดต่อยีน T-cell receptor (TCR) นอกร่างกาย (Ex vivo) เพื่อสร้าง TCR-T cells ที่จำเพาะต่อแอนติเจนของมะเร็งชนิด Solid tumors.\n\nการพัฒนาและวิธีการ\nทีมวิจัยได้ใช้ Guide RNA (gRNA) ที่จำเพาะต่อยีน PD-1 เพื่อลดการเกิด T-cell exhaustion ผสมผสานกับการแทรกยีน TCR ที่จับกับ NY-ESO-1 antigen ผลการทดสอบทางเภสัชพลศาสตร์ (Pharmacodynamics) ในหลอดทดลอง (In vitro) และในหนูทดลอง (In vivo) แสดงให้เห็นว่า CRISPR-edited TCR-T cells มีความสามารถในการทำลายเซลล์มะเร็งได้ดีกว่า T-cells ทั่วไปถึง 3.5 เท่า และคงสภาพอยู่ได้นานกว่า.\n\nบทบาททางเภสัชกรรม (Pharmacological perspective)\nความท้าทายทางเภสัชกรรมที่สำคัญคือ 1) Off-target effects ของการใช้ CRISPR ซึ่งเภสัชกรต้องมีส่วนร่วมในการตรวจสอบคุณภาพ (Quality Control) และความปลอดภัยของจีโนม 2) การเกิดปฏิกิริยาภูมิคุ้มกันต่อเอนไซม์ Cas9 (Immunogenicity) ซึ่งอาจลดประสิทธิภาพของ ATMPs 3) การพัฒนาระบบนำส่ง (Delivery systems) เช่น Lipid Nanoparticles (LNPs) เพื่อเพิ่มประสิทธิภาพการนำ Cas9 เข้าสู่เซลล์\n\nข้อสรุป\nการใช้เทคโนโลยี CRISPR ในการผลิต ATMPs เป็นทางเลือกที่มีอนาคตไกล แต่จำเป็นต้องมีการศึกษาด้าน Pharmacokinetics ของเซลล์บำบัดอย่างละเอียด (Cellular Kinetics) รวมถึงการจัดตั้งกรอบการกำกับดูแลที่ครอบคลุมถึงระดับพันธุกรรม เพื่อให้เกิดความปลอดภัยสูงสุดต่อผู้ป่วย."
  },
  {
    id: "R2026-ATMP5",
    title: "Mesenchymal Stem Cell (MSC) Therapies in Autoimmune Diseases: Systematic Review",
    authors: "เจริญสุข ศรีไพศาล",
    journal: "วารสารเภสัชกรรมไทย ปีที่ 17 ฉบับที่ 3",
    abstract: "การทบทวนวรรณกรรมอย่างเป็นระบบถึงประสิทธิผลและความปลอดภัยของการใช้สเต็มเซลล์มีเซนไคม์ในโรคภูมิคุ้มกันบกพร่อง...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2024,
    language: "ไทย",
    publisher: "วารสารเภสัชกรรมไทย",
    doi: "10.14456/tjp.2024.18",
    relevanceScore: 96,
    content: "บทคัดย่อ/บทนำ\nMesenchymal Stem Cells (MSCs) เป็นหนึ่งในเซลล์บำบัด (ATMPs) ที่ได้รับความสนใจอย่างมากในการรักษาโรคแพ้ภูมิตัวเอง (Autoimmune Diseases) เช่น Systemic Lupus Erythematosus (SLE) และ Rheumatoid Arthritis เนื่องจากคุณสมบัติในการปรับเปลี่ยนภูมิคุ้มกัน (Immunomodulatory properties) การศึกษานี้เป็นการทบทวนวรรณกรรมอย่างเป็นระบบ (Systematic Review) จากฐานข้อมูล PubMed, Scopus และ Cochrane Library.\n\nการรวบรวมข้อมูลและผลการวิเคราะห์\nจากการวิเคราะห์งานวิจัยเชิงทดลองทางคลินิก (RCTs) จำนวน 14 ฉบับ ที่ครอบคลุมผู้ป่วยรวม 850 ราย พบว่าการฉีด MSCs (ทั้งแบบ Autologous และ Allogeneic) ทางหลอดเลือดดำ ช่วยลดดัชนีชี้วัดความรุนแรงของโรค (เช่น SLEDAI score) ได้อย่างมีนัยสำคัญทางสถิติเมื่อเทียบกับกลุ่มควบคุม ภายใน 6 เดือนแรกหลังได้รับการรักษา อัตราการรอดชีวิตของผู้ป่วยที่ดื้อต่อยากดภูมิคุ้มกันมาตรฐานเพิ่มขึ้น 15%.\nด้านความปลอดภัย (Safety Profile): ไม่พบอุบัติการณ์การเกิดก้อนมะเร็ง (Tumorigenicity) อย่างชัดเจน แต่มีรายงานผลข้างเคียงเล็กน้อย เช่น ไข้ หนาวสั่น ซึ่งสัมพันธ์กับการให้เซลล์ (Infusion-related reactions) ในอัตราร้อยละ 4.2\n\nการนำไปใช้ทางคลินิก\nสำหรับเภสัชกรคลินิก ประเด็นสำคัญคือความแปรปรวนของคุณภาพเซลล์แต่ละ Batch (Batch-to-Batch variability) ที่อาจส่งผลต่อการตอบสนองทางคลินิกที่ต่างกัน การจัดเก็บ MSCs ต้องควบคุมอุณหภูมิที่ -196 องศาเซลเซียส (Cryopreservation) อย่างเคร่งครัด การประเมินปฏิกิริยาระหว่าง MSCs กับยาที่ผู้ป่วยใช้อยู่ (Cell-Drug Interactions) ยังคงเป็นความท้าทายใหม่ที่ต้องอาศัยการทำงานร่วมกันแบบสหสาขาวิชาชีพ เพื่อบูรณาการเซลล์บำบัดเข้าสู่แนวทางการรักษาทางคลินิกต่อไป."
  },
  {
    id: "R2022-001",
    title: "การติดตามผลการใช้ยา Warfarin ในผู้ป่วยโรคหัวใจห้องบนสั่นพริ้วในโรงพยาบาลศิริราช",
    authors: "นิตยา จันทร์เจริญ, ศิริขวัญ กิตติพงษ์, ประภาพร ประเสริฐสรรพ์ และคณะ",
    journal: "วารสารเภสัชกรรมไทย ปีที่ 14 ฉบับที่ 2",
    abstract: "การศึกษานี้มีวัตถุประสงค์เพื่อประเมินผลการติดตามการใช้ยา warfarin ในผู้ป่วยโรคหัวใจห้องบนสั่นพริ้วเปรียบเทียบค่า INR...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2022,
    language: "ไทย",
    publisher: "วารสารเภสัชกรรมไทย",
    doi: "10.14456/tjp.2022.15",
    relevanceScore: 95
  },
  {
    id: "R2020-002",
    title: "Warfarin dose requirements and factors affecting anticoagulation control in Thai patients",
    authors: "Pattaraporn Promsri, Thitima Rattanawong, Somchai Vannaprasaht et al.",
    journal: "Thai Journal of Pharmacy Practice Vol. 12 No. 1",
    abstract: "This study aimed to determine warfarin dose requirements and factors associated with time in therapeutic range (TTR)...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2020,
    language: "อังกฤษ",
    publisher: "Thai Journal of Pharmacy Practice",
    doi: "10.14456/tjpp.2020.01",
    relevanceScore: 92
  },
  {
    id: "R2021-003",
    title: "แนวทางการบริหารจัดการยา Warfarin ในผู้ป่วยนอก: ข้อเสนอแนะสำหรับเภสัชกร",
    authors: "สมชาย วัฒนกิจ, อรวรรณ ลีลาวรินทร์",
    journal: "เอกสารแนวทางปฏิบัติ สภาเภสัชกรรม",
    abstract: "แนวทางฉบับนี้จัดทำขึ้นเพื่อเป็นแนวทางสำหรับเภสัชกรในการบริหารจัดการยา warfarin ในผู้ป่วยนอก ครอบคลุมการประเมินความเสี่ยง...",
    type: "บทความวิชาการ",
    field: "เภสัชกรรมชุมชน",
    year: 2021,
    language: "ไทย",
    publisher: "สภาเภสัชกรรม",
    doi: "10.14456/tpc.2021.05",
    relevanceScore: 88
  },
  {
    id: "R2019-004",
    title: "Drug interactions of warfarin with herbal medicines: a systematic review",
    authors: "Kornkanok Ingkaninan, Sujitra Wongpoowarak",
    journal: "Journal of Herbal Medicine Research Vol. 8 No. 2",
    abstract: "Background: Warfarin is a widely used oral anticoagulant with a narrow therapeutic index and numerous drug interactions...",
    type: "บทความวิชาการ",
    field: "เภสัชเวทและพิษวิทยา",
    year: 2019,
    language: "อังกฤษ",
    publisher: "อื่นๆ",
    doi: "10.14456/jhmr.2019.05",
    relevanceScore: 85
  },
  {
    id: "R2020-005",
    title: "การพัฒนาโปรแกรมติดตามการใช้ Warfarin โดยเภสัชกรในโรงพยาบาลชุมชน",
    authors: "กฤษฎา พุ่มพฤกษา, จิราภรณ์ ศรีสุวรรณ, และคณะ",
    journal: "รายงานการวิจัย สภาเภสัชกรรม",
    abstract: "การวิจัยนี้เป็นการพัฒนาและประเมินผลโปรแกรมการติดตามการใช้ warfarin โดยเภสัชกรในโรงพยาบาลชุมชน...",
    type: "รายงานการวิจัย",
    field: "เภสัชกรรมโรงพยาบาล",
    year: 2020,
    language: "ไทย",
    publisher: "สภาเภสัชกรรม",
    doi: "10.14456/tpc.2020.12",
    relevanceScore: 80
  },
  {
    id: "R2023-006",
    title: "ความชุกและปัจจัยเสี่ยงของการเกิดภาวะเลือดออกผิดปกติจากการใช้ Warfarin ในผู้สูงอายุ",
    authors: "ณัฐวุฒิ สมบูรณ์, พิมพ์ชนก สุวรรณรัตน์",
    journal: "วารสารเภสัชกรรมคลินิก ปีที่ 29 ฉบับที่ 1",
    abstract: "ศึกษาความชุกและปัจจัยที่สัมพันธ์กับการเกิดภาวะเลือดออกในผู้สูงอายุที่ได้รับยา warfarin เป็นเวลานานในโรงพยาบาลศูนย์...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2023,
    language: "ไทย",
    publisher: "อื่นๆ",
    doi: "10.14456/tjcp.2023.01",
    relevanceScore: 78
  },
  {
    id: "R2024-007",
    title: "Cost-effectiveness analysis of pharmacogenetic-guided warfarin dosing in Thailand",
    authors: "Supornchai Kongpatanakul, Vithaya Kulsomboon",
    journal: "Thai Journal of Pharmacy Practice Vol. 16 No. 2",
    abstract: "A cost-effectiveness analysis evaluating the economic impact of implementing PGx-guided warfarin dosing compared to standard dosing...",
    type: "บทความวิจัย",
    field: "เภสัชศาสตร์สังคมบริหาร",
    year: 2024,
    language: "อังกฤษ",
    publisher: "Thai Journal of Pharmacy Practice",
    doi: "10.14456/tjpp.2024.08",
    relevanceScore: 75
  },
  {
    id: "R2022-008",
    title: "ผลของการให้คำปรึกษาเรื่องยา Warfarin โดยเภสัชกรผ่านระบบ Telepharmacy",
    authors: "พัชรีพร สุดใจ, อานนท์ รักษาดี",
    journal: "วารสารเภสัชกรรมโรงพยาบาล ปีที่ 32 ฉบับที่ 3",
    abstract: "ประเมินประสิทธิผลของการให้บริการ Telepharmacy แก่ผู้ป่วยที่ได้รับยา warfarin ในช่วงสถานการณ์การแพร่ระบาดของ COVID-19...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมโรงพยาบาล",
    year: 2022,
    language: "ไทย",
    publisher: "อื่นๆ",
    doi: "10.14456/hpj.2022.25",
    relevanceScore: 72
  },
  {
    id: "R2023-009",
    title: "ความรู้ความเข้าใจเกี่ยวกับการใช้ยา Warfarin ของผู้ป่วยในร้านยาชุมชนเขตกรุงเทพมหานคร",
    authors: "วิลาวรรณ ทองธรรมชาติ",
    journal: "วิทยานิพนธ์ คณะเภสัชศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    abstract: "การวิจัยเชิงสำรวจเพื่อประเมินระดับความรู้เกี่ยวกับการใช้ยา warfarin และการปฏิบัติตัวของผู้ป่วยที่มารับบริการในร้านยาชุมชน...",
    type: "วิทยานิพนธ์",
    field: "เภสัชกรรมชุมชน",
    year: 2023,
    language: "ไทย",
    publisher: "อื่นๆ",
    doi: "10.14456/cu.2023.112",
    relevanceScore: 70
  },
  {
    id: "R2024-010",
    title: "Impact of clinical pharmacist interventions on warfarin therapy management: A multi-center study",
    authors: "Chanida Palanuvej, Nijsiri Ruangrungsi",
    journal: "Asian Journal of Pharmaceutical Sciences",
    abstract: "This study highlights the significant positive outcomes associated with active clinical pharmacist involvement in warfarin therapy...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2024,
    language: "อังกฤษ",
    publisher: "อื่นๆ",
    doi: "10.1016/j.ajps.2024.03.005",
    relevanceScore: 68
  },
  {
    id: "R2021-011",
    title: "การวิเคราะห์ปัญหาที่เกิดจากการใช้ยา (Drug-Related Problems) ในผู้ป่วยที่ได้รับยา Warfarin",
    authors: "ศิริรัตน์ โชติวิวัฒนกุล",
    journal: "วารสารเภสัชกรรมไทย ปีที่ 13 ฉบับที่ 4",
    abstract: "รวบรวมและวิเคราะห์อุบัติการณ์ของปัญหาที่เกิดจากการใช้ยาในผู้ป่วยนอกที่ได้รับยา warfarin จากคลินิกต้านการแข็งตัวของเลือด...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2021,
    language: "ไทย",
    publisher: "วารสารเภสัชกรรมไทย",
    doi: "10.14456/tjp.2021.42",
    relevanceScore: 65
  },
  {
    id: "R2025-012",
    title: "แนวทางการบูรณาการข้อมูลค่า INR กับระบบประวัติสุขภาพอิเล็กทรอนิกส์ระดับชาติ",
    authors: "ธนาวุฒิ สมสิน",
    journal: "เอกสารนำเสนอ งานประชุมวิชาการเภสัชกรรมแห่งชาติ",
    abstract: "นำเสนอโมเดลต้นแบบในการเชื่อมโยงข้อมูลผลแล็บ INR จากโรงพยาบาลต่างๆ เข้าสู่ระบบฐานข้อมูลส่วนกลางเพื่อความปลอดภัยในการส่งต่อผู้ป่วย...",
    type: "เอกสารนำเสนอ",
    field: "เภสัชศาสตร์สังคมบริหาร",
    year: 2025,
    language: "ไทย",
    publisher: "สภาเภสัชกรรม",
    doi: "10.14456/npc.2025.15",
    relevanceScore: 60
  },
  {
    id: "R2023-013",
    title: "Patient adherence to warfarin therapy and its association with health literacy",
    authors: "Wanida Pongsakorn",
    journal: "Thai Journal of Pharmacy Practice Vol. 15 No. 3",
    abstract: "Evaluating the relationship between functional health literacy and medication adherence among elderly patients prescribed warfarin...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมชุมชน",
    year: 2023,
    language: "อังกฤษ",
    publisher: "Thai Journal of Pharmacy Practice",
    doi: "10.14456/tjpp.2023.21",
    relevanceScore: 58
  },
  {
    id: "R2022-014",
    title: "ผลกระทบของการบริโภคผลิตภัณฑ์เสริมอาหารที่มีวิตามินเคต่อระดับ INR ในผู้ป่วยที่ใช้ Warfarin",
    authors: "มณีรัตน์ สุวรรณโชติ, สุรศักดิ์ ศรีวิจิตร",
    journal: "รายงานการวิจัย คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล",
    abstract: "การศึกษาแบบ prospective cohort เพื่อติดตามการเปลี่ยนแปลงของระดับ INR ในผู้ป่วยที่เริ่มบริโภคผลิตภัณฑ์เสริมอาหารบางชนิด...",
    type: "รายงานการวิจัย",
    field: "เภสัชเวทและพิษวิทยา",
    year: 2022,
    language: "ไทย",
    publisher: "อื่นๆ",
    doi: "10.14456/mu.2022.09",
    relevanceScore: 55
  },
  {
    id: "R2026-015",
    title: "การพัฒนาระบบ AI เพื่อทำนายขนาดยา Warfarin ที่เหมาะสมสำหรับประชากรไทย",
    authors: "วรวุฒิ จันทรพิทักษ์",
    journal: "วารสารเภสัชกรรมไทย ปีที่ 18 ฉบับที่ 1",
    abstract: "การใช้ Machine Learning model ในการทำนายขนาดยาที่เหมาะสมโดยวิเคราะห์จากปัจจัยทางคลินิกและข้อมูลพันธุกรรม...",
    type: "บทความวิจัย",
    field: "เภสัชกรรมคลินิก",
    year: 2026,
    language: "ไทย",
    publisher: "วารสารเภสัชกรรมไทย",
    doi: "10.14456/tjp.2026.02",
    relevanceScore: 50
  }
];
