import React from 'react';

// Service color mapping for Spark components
const SERVICE_COLORS: Record<string, string> = {
    'spark-app': '#6B4FBB',
    'spark-sql': '#F95F53',
    'spark-job': '#00A8E1',
    'spark-stage': '#FF9E3D',
    'spark-executor': '#94CF50',
    srvc: '#999',
};

interface SpanNode {
    span_id: string;
    parent_id: string;
    service: string;
    resource: string;
    name: string;
    start: number;
    end: number;
    duration: number;
    children_ids: string[];
    depth: number;
    totalDescendants: number;
}

// Simple Caret Icons
const CaretRightIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M4.5 2.5L8 6L4.5 9.5V2.5Z" />
    </svg>
);

const CaretDownIcon: React.FC = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <path d="M2.5 4.5L6 8L9.5 4.5H2.5Z" />
    </svg>
);

// Apache Spark Logo Icon
const SparkIcon: React.FC = () => (
    <img 
        src="/images/apache-spark.png" 
        alt="Spark" 
        width="14" 
        height="14" 
        style={{ display: 'block' }}
    />
);

// Custom Waterfall Span Row Component
const WaterfallSpanRow: React.FC<{
    span: SpanNode;
    traceStart: number;
    traceEnd: number;
    selected: boolean;
    hovered: boolean;
    highlighted?: boolean;
    isCollapsed: boolean;
    hasChildren: boolean;
    onToggle: () => void;
    onHover: () => void;
    onLeave: () => void;
    isGhost?: boolean;
    hasHiddenParent?: boolean;
    hasHiddenChildren?: boolean;
    ancestorCount?: number;
    hiddenChildrenCount?: number;
    onRevealParent?: () => void;
    onRevealChildren?: () => void;
}> = ({
    span,
    traceStart,
    traceEnd,
    selected,
    hovered,
    highlighted = false,
    isCollapsed,
    hasChildren,
    onToggle,
    onHover,
    onLeave,
    isGhost = false,
    hasHiddenParent = false,
    hasHiddenChildren = false,
    ancestorCount = 0,
    hiddenChildrenCount = 0,
    onRevealParent,
    onRevealChildren,
}) => {
    const traceDuration = traceEnd - traceStart;
    const leftPercent = ((span.start - traceStart) / traceDuration) * 100;
    const widthPercent = (span.duration / traceDuration) * 100;
    const color = SERVICE_COLORS[span.service] || '#999';
    const formatDuration = (seconds: number) =>
        seconds >= 1
            ? `${seconds.toFixed(1)}s`
            : seconds >= 0.001
            ? `${(seconds * 1000).toFixed(0)}ms`
            : `${(seconds * 1000000).toFixed(0)}µs`;

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 0',
                cursor: 'pointer',
                borderRadius: '6px',
                backgroundColor: highlighted
                    ? 'rgba(74, 144, 226, 0.15)'
                    : hovered
                    ? 'rgba(0, 0, 0, 0.03)'
                    : 'transparent',
                borderLeft: isGhost ? '3px dashed #ccc' : '3px solid transparent',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                minWidth: '1150px',
                opacity: isGhost ? 0.4 : 1,
                transition: 'background-color 0.3s, opacity 0.2s',
            }}
            onClick={onToggle}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            title={isGhost ? 'Click to reveal' : span.name}
        >
            {/* Name/Operation column - Fixed width container */}
            <div
                style={{
                    width: '480px',
                    fontSize: '13px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                }}
                title={span.name}
            >
                {/* Indentation spacer */}
                <div style={{ width: `${span.depth * 20 + 12}px`, flexShrink: 0 }} />
                
                {/* Content area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                    {hasChildren && (
                        <>
                            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: '#666' }}>
                                {isCollapsed ? <CaretRightIcon /> : <CaretDownIcon />}
                            </span>
                            <span
                                style={{
                                    fontSize: '11px',
                                    color: '#999',
                                    fontWeight: 500,
                                    minWidth: '20px',
                                    flexShrink: 0,
                                }}
                            >
                                {span.totalDescendants}
                            </span>
                        </>
                    )}
                    {!hasChildren && span.depth > 0 && (
                        <div style={{ width: '36px', flexShrink: 0 }} />
                    )}
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                        <SparkIcon />
                    </span>
                    <span
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        {span.name}
                    </span>
                    
                    {/* Smart mode indicators */}
                    {hasHiddenParent && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRevealParent?.();
                            }}
                            style={{
                                marginLeft: '8px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#666',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#999';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff';
                                e.currentTarget.style.borderColor = '#ddd';
                            }}
                            title={`Click to reveal parent (${ancestorCount} level${ancestorCount > 1 ? 's' : ''} up)`}
                        >
                            ↑ {ancestorCount}
                        </button>
                    )}
                    
                    {hasHiddenChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRevealChildren?.();
                            }}
                            style={{
                                marginLeft: '8px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#666',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#999';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#fff';
                                e.currentTarget.style.borderColor = '#ddd';
                            }}
                            title={`Click to reveal ${hiddenChildrenCount} child${hiddenChildrenCount > 1 ? 'ren' : ''}`}
                        >
                            ↓ {hiddenChildrenCount}
                        </button>
                    )}
                </div>
            </div>

            {/* Component column */}
            <div
                style={{
                    width: '150px',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    paddingLeft: '24px',
                    paddingRight: '16px',
                    textAlign: 'left',
                    color: '#999',
                }}
            >
                {span.service}
            </div>

            {/* Timeline visualization */}
            <div
                style={{
                    flex: 1,
                    minWidth: '400px',
                    position: 'relative',
                    height: '24px',
                    marginRight: '12px',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 0.5)}%`,
                        height: '16px',
                        top: '4px',
                        backgroundColor: isGhost ? 'transparent' : color,
                        border: isGhost ? `2px dashed ${color}` : 'none',
                        borderRadius: '3px',
                        opacity: hovered ? 1 : 0.85,
                        transition: 'opacity 0.15s',
                    }}
                />
                {/* Duration right next to the bar */}
                <div
                    style={{
                        position: 'absolute',
                        left: `${Math.min(leftPercent + widthPercent + 0.5, 98)}%`,
                        fontSize: '11px',
                        color: '#666',
                        whiteSpace: 'nowrap',
                        paddingLeft: '6px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                >
                    {formatDuration(span.duration)}
                </div>
            </div>
        </div>
    );
};

// Sliders Icon
const SlidersIcon: React.FC = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14"></line>
        <line x1="4" y1="10" x2="4" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12" y2="3"></line>
        <line x1="20" y1="21" x2="20" y2="16"></line>
        <line x1="20" y1="12" x2="20" y2="3"></line>
        <line x1="1" y1="14" x2="7" y2="14"></line>
        <line x1="9" y1="8" x2="15" y2="8"></line>
        <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
);

type PrototypeMode = 'filter' | 'collapse' | 'ghost' | 'smart';

function TraceWaterfall() {
    const [prototypeMode, setPrototypeMode] = React.useState<PrototypeMode>('collapse');
    const [hoveredSpanId, setHoveredSpanId] = React.useState<string | null>(
        null
    );
    const [collapsedSpans, setCollapsedSpans] = React.useState<Set<string>>(
        new Set()
    );
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [hoveredFilterItem, setHoveredFilterItem] = React.useState<string | null>(null);
    
    // Collapse to mode state
    const [collapseToType, setCollapseToType] = React.useState<string | null>(null);
    
    // Filter by mode state
    const [visibleTypes, setVisibleTypes] = React.useState<Set<string>>(
        new Set(['spark-app', 'spark-sql', 'spark-job', 'spark-stage'])
    );
    
    // Ghost mode state
    const [ghostVisibleTypes, setGhostVisibleTypes] = React.useState<Set<string>>(
        new Set(['spark-stage']) // Default to showing only Stages
    );
    const [revealedGhostSpans, setRevealedGhostSpans] = React.useState<Set<string>>(new Set());
    
    // Smart mode state
    const [smartVisibleType, setSmartVisibleType] = React.useState<string>('spark-stage');
    const [revealedSmartSpans, setRevealedSmartSpans] = React.useState<Set<string>>(new Set());
    const [highlightedSpans, setHighlightedSpans] = React.useState<Set<string>>(new Set());

    // Generate mock Spark trace data
    const mockTraceTree = React.useMemo(() => {
        const spans: Record<string, any> = {};
        let spanIdCounter = 0;
        const getNextId = () => (spanIdCounter++).toString();

        // Helper to create a span
        const createSpan = (
            service: string,
            resource: string,
            name: string,
            parent_id: string,
            start: number,
            duration: number
        ) => {
            const span_id = getNextId();
            const span = {
                span_id,
                parent_id,
                service,
                resource,
                name,
                start,
                end: start + duration,
                duration,
                children_ids: [] as string[],
            };
            
            spans[span_id] = span;
            
            // Add this span to parent's children (if parent exists in spans)
            if (spans[parent_id]) {
                if (!Array.isArray(spans[parent_id].children_ids)) {
                    spans[parent_id].children_ids = [];
                }
                spans[parent_id].children_ids.push(span_id);
            }
            return span_id;
        };

        // Helper to create sequential children (waterfall style)
        const addSequentialChildren = (
            parentId: string,
            parentStart: number,
            parentDuration: number,
            childConfigs: Array<{
                service: string;
                resource: string;
                name: string;
                duration: number;
                children?: Array<{
                    service: string;
                    resource: string;
                    name: string;
                    duration: number;
                    children?: Array<{
                        service: string;
                        resource: string;
                        name: string;
                        duration: number;
                    }>;
                }>;
            }>,
        ): number => {
            let currentStart = parentStart;
            for (const config of childConfigs) {
                // Ensure child fits within parent bounds
                const childStart = currentStart;
                const childDuration = Math.min(config.duration, parentStart + parentDuration - childStart);
                
                const childId = createSpan(
                    config.service,
                    config.resource,
                    config.name,
                    parentId,
                    childStart,
                    childDuration,
                );
                
                // Recursively add grandchildren
                if (config.children) {
                    addSequentialChildren(childId, childStart, childDuration, config.children);
                }
                
                currentStart += childDuration;
            }
            return currentStart - parentStart; // Return total duration
        };

        // Define waterfall structure - sequential operations
        const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
        const names = {
            queries: [
                "SELECT c.customer_id, c.customer_name, SUM(s.sale_amount) as total_sales, COUNT(DISTINCT s.transaction_id) as transaction_count FROM prod_warehouse.sales_fact s JOIN prod_warehouse.customer_dim c ON s.customer_key = c.customer_key WHERE s.sale_date BETWEEN '2024-01-01' AND '2024-12-31' AND s.region IN ('US-WEST', 'US-EAST') GROUP BY c.customer_id, c.customer_name HAVING SUM(s.sale_amount) > 10000",
                "INSERT OVERWRITE TABLE prod_warehouse.customer_sales_summary PARTITION(report_date='2024-12-31') SELECT customer_id, customer_name, total_sales, transaction_count FROM aggregated_results",
                "SELECT date_trunc('month', sale_date) AS month, SUM(sale_amount) AS monthly_sales FROM prod_warehouse.sales_fact WHERE sale_date >= '2024-01-01' GROUP BY date_trunc('month', sale_date) ORDER BY month ASC",
                "SELECT product_id, SUM(quantity) FROM prod_warehouse.order_items GROUP BY product_id ORDER BY SUM(quantity) DESC",
                "SELECT category, AVG(unit_price) FROM prod_warehouse.products GROUP BY category",
                "SELECT customer_id, COUNT(*) FROM prod_warehouse.orders WHERE status='DELIVERED' GROUP BY customer_id",
                "SELECT region, SUM(sale_amount) FROM prod_warehouse.sales_fact GROUP BY region",
                "SELECT supplier_id, COUNT(DISTINCT product_id) FROM prod_warehouse.products GROUP BY supplier_id",
                "SELECT date_trunc('day', sale_date) AS day, SUM(sale_amount) FROM prod_warehouse.sales_fact GROUP BY day",
                "SELECT country, COUNT(*) FROM prod_warehouse.customers GROUP BY country",
            ] as const,
            stageOps: [
                'Scan parquet s3a://company-prod-data/warehouse/sales_fact (200 partitions, 45.2 GB)',
                'Filter [region IN (US-WEST, US-EAST)] + Project [customer_key, sale_amount, transaction_id]',
                'Exchange hashpartitioning(customer_id, 200) (8.2M rows → 200 partitions, 1.2 GB shuffle write)',
                'HashAggregate(keys=[customer_id#45, customer_name#46], functions=[sum(sale_amount#12), count(distinct transaction_id#8)])',
                'Write s3a://company-prod-data/warehouse/customer_sales_summary/report_date=2024-12-31/ (2.1K rows → 50 files, snappy compression)',
                'Scan parquet s3a://company-prod-data/warehouse/sales_fact (150 partitions, 35.8 GB)',
                'Exchange rangepartitioning(month, 120) (0.9 GB shuffle)',
                'HashAggregate(keys=[month], functions=[sum(sale_amount)])',
                'BroadcastHashJoin build-side broadcast (customer_dim 120MB)',
                'Scan parquet s3a://company-prod-data/raw/events',
                'Scan parquet s3a://company-prod-data/warehouse/order_items',
                'Scan parquet s3a://company-prod-data/warehouse/products',
                'Exchange hashpartitioning(customer_id, 200)',
                'Exchange rangepartitioning(day, 180)',
                'Filter [status = DELIVERED]',
                'Project [customer_id, product_id, quantity]',
                'SortMergeJoin(customer_id)',
            ] as const,
        } as const;

        // Spark Application (root) - calculate total duration from children
        const appStart = 0;
        
        // Generate sequential children for the app
        const appChildren: Array<{
            service: string;
            resource: string;
            name: string;
            duration: number;
            children?: Array<{
                service: string;
                resource: string;
                name: string;
                duration: number;
                children?: Array<{
                    service: string;
                    resource: string;
                    name: string;
                    duration: number;
                }>;
            }>;
        }> = [];

        // Generate 12 SQL queries + 3 app-level jobs = 15 top-level children
        for (let i = 0; i < 12; i++) {
            const queryName = pick(names.queries);
            const jobCount = 2 + Math.floor(Math.random() * 3); // 2-4 jobs per query
            const queryDuration = 8 + Math.random() * 15; // 8-23 seconds per query
            
            const jobs: Array<{
                service: string;
                resource: string;
                name: string;
                duration: number;
                children?: Array<{
                    service: string;
                    resource: string;
                    name: string;
                    duration: number;
                }>;
            }> = [];
            
            for (let j = 0; j < jobCount; j++) {
                const stageCount = 1 + Math.floor(Math.random() * 3); // 1-3 stages per job
                const jobDuration = queryDuration / jobCount * (0.8 + Math.random() * 0.4);
                
                const stages: Array<{
                    service: string;
                    resource: string;
                    name: string;
                    duration: number;
                }> = [];
                
                for (let s = 0; s < stageCount; s++) {
                    stages.push({
                        service: 'spark-stage',
                        resource: 'spark.stage',
                        name: `Stage ${Math.floor(Math.random() * 100)}: ${pick(names.stageOps)}`,
                        duration: jobDuration / stageCount * (0.85 + Math.random() * 0.3),
                    });
                }
                
                jobs.push({
                    service: 'spark-job',
                    resource: 'spark.job',
                    name: `Job ${Math.floor(Math.random() * 200)}: ${pick(names.stageOps)}`,
                    duration: jobDuration,
                    children: stages,
                });
            }
            
            appChildren.push({
                service: 'spark-sql',
                resource: 'spark.query',
                name: queryName,
                duration: queryDuration,
                children: jobs,
            });
        }

        // Add a very long SQL query with a very long stage (bottleneck scenario)
        const longQueryJobs: Array<{
            service: string;
            resource: string;
            name: string;
            duration: number;
            children?: Array<{
                service: string;
                resource: string;
                name: string;
                duration: number;
            }>;
        }> = [];
        
        // Create a job with one very long stage and a couple shorter ones
        const longStageDuration = 45; // Much longer than typical stages
        const longJobDuration = 52; // Total job duration
        
        const longJobStages: Array<{
            service: string;
            resource: string;
            name: string;
            duration: number;
        }> = [
            {
                service: 'spark-stage',
                resource: 'spark.stage',
                name: 'Stage 42: Scan parquet s3a://company-prod-data/warehouse/yearly_sales_archive (1500 partitions, 2.1 TB) - FULL TABLE SCAN',
                duration: longStageDuration,
            },
            {
                service: 'spark-stage',
                resource: 'spark.stage',
                name: 'Stage 43: Exchange hashpartitioning(date_key, 500) (45.2M rows → 500 partitions, 8.5 GB shuffle write)',
                duration: 4.5,
            },
            {
                service: 'spark-stage',
                resource: 'spark.stage',
                name: 'Stage 44: HashAggregate(keys=[date_key, product_id], functions=[sum(amount), count(*)]',
                duration: 2.5,
            },
        ];
        
        longQueryJobs.push({
            service: 'spark-job',
            resource: 'spark.job',
            name: 'Job 156: Full table scan and aggregation on yearly archive (SLOW)',
            duration: longJobDuration,
            children: longJobStages,
        });
        
        // Add a second shorter job in the same query
        const secondJobStages: Array<{
            service: string;
            resource: string;
            name: string;
            duration: number;
        }> = [
            {
                service: 'spark-stage',
                resource: 'spark.stage',
                name: 'Stage 45: Write results to s3a://company-prod-data/warehouse/annual_summary/ (12K rows, 15 files)',
                duration: 3.2,
            },
        ];
        
        longQueryJobs.push({
            service: 'spark-job',
            resource: 'spark.job',
            name: 'Job 157: Write aggregated results',
            duration: 3.2,
            children: secondJobStages,
        });
        
        appChildren.push({
            service: 'spark-sql',
            resource: 'spark.query',
            name: 'SELECT date_key, product_id, SUM(amount) as total_sales, COUNT(*) as transaction_count FROM prod_warehouse.yearly_sales_archive WHERE sale_date >= \'2020-01-01\' GROUP BY date_key, product_id ORDER BY date_key DESC, total_sales DESC LIMIT 1000000',
            duration: longJobDuration + 3.2, // Total query duration
            children: longQueryJobs,
        });

        // Add 3 app-level jobs (same level as SQL queries)
        for (let i = 0; i < 3; i++) {
            const stageCount = 1 + Math.floor(Math.random() * 2); // 1-2 stages
            const jobDuration = 4 + Math.random() * 8; // 4-12 seconds
            
            const stages: Array<{
                service: string;
                resource: string;
                name: string;
                duration: number;
            }> = [];
            
            for (let s = 0; s < stageCount; s++) {
                stages.push({
                    service: 'spark-stage',
                    resource: 'spark.stage',
                    name: `Stage ${Math.floor(Math.random() * 100)}: ${pick(names.stageOps)}`,
                    duration: jobDuration / stageCount * (0.85 + Math.random() * 0.3),
                });
            }
            
            appChildren.push({
                service: 'spark-job',
                resource: 'spark.job',
                name: `Job ${Math.floor(Math.random() * 200)}: ${pick(names.stageOps)}`,
                duration: jobDuration,
                children: stages,
            });
        }

        // Calculate total app duration from sequential children
        const totalAppDuration = appChildren.reduce((sum, child) => sum + child.duration, 0);
        
        // Create the app span
        const appId = createSpan(
            'spark-app',
            'spark.application',
            'application_1234567890123_0456: etl-prod-daily-sales-aggregation-v2',
            '0',
            appStart,
            totalAppDuration,
        );

        // Add all sequential children to the app
        addSequentialChildren(appId, appStart, totalAppDuration, appChildren);
        
        return {
            root_id: appId,
            spans,
        };
    }, []);

    // Build ordered list of spans with depth info
    const orderedSpans = React.useMemo(() => {
        const spans: SpanNode[] = [];
        const spansMap = mockTraceTree.spans;
        const visited = new Set<string>();

        // Count total descendants for each span
        const countDescendants = (spanId: string, countVisited: Set<string> = new Set()): number => {
            const span = spansMap[spanId];
            if (!span || !Array.isArray(span.children_ids) || span.children_ids.length === 0) {
                return 0;
            }
            
            // Prevent infinite loops
            if (countVisited.has(spanId)) {
                return 0;
            }
            countVisited.add(spanId);
            
            let total = span.children_ids.length;
            span.children_ids.forEach((childId: string) => {
                total += countDescendants(childId, countVisited);
            });
            
            return total;
        };

        const buildTree = (spanId: string, depth: number) => {
            const span = spansMap[spanId];
            if (!span) return;
            
            // Prevent infinite loops from circular references
            if (visited.has(spanId)) {
                console.warn('Circular reference detected for span:', spanId);
                return;
            }
            visited.add(spanId);

            spans.push({
                ...span,
                depth,
                totalDescendants: countDescendants(spanId),
            });

            // Recursively add children
            if (Array.isArray(span.children_ids)) {
                span.children_ids.forEach((childId: string) => {
                    buildTree(childId, depth + 1);
                });
            }
        };

        buildTree(mockTraceTree.root_id, 0);
        
        // Filter out collapsed children
        const visibleSpans = spans.filter((span) => {
            // Check if any ancestor is collapsed
            let currentParentId = span.parent_id;
            while (currentParentId !== '0') {
                if (collapsedSpans.has(currentParentId)) {
                    return false;
                }
                const parentSpan = spansMap[currentParentId];
                if (!parentSpan) break;
                currentParentId = parentSpan.parent_id;
            }
            return true;
        });
        
        return visibleSpans;
    }, [mockTraceTree, collapsedSpans]);

    // Calculate trace bounds
    const { traceStart, traceEnd } = React.useMemo(() => {
        const starts = orderedSpans.map((s) => s.start);
        const ends = orderedSpans.map((s) => s.end);
        const start = Math.min(...starts);
        const end = Math.max(...ends);
        return {
            traceStart: start,
            traceEnd: end,
            totalDuration: end - start,
        };
    }, [orderedSpans]);

    const toggleCollapse = (spanId: string) => {
        setCollapsedSpans((prev) => {
            const next = new Set(prev);
            if (next.has(spanId)) {
                next.delete(spanId);
            } else {
                next.add(spanId);
            }
            return next;
        });
    };

    // Collapse to mode functions
    const applyCollapseTo = (type: string | null) => {
        if (type === null) {
            // Expand all
            setCollapsedSpans(new Set());
            setCollapseToType(null);
        } else {
            // Collapse to specific type
            const newCollapsed = new Set<string>();
            
            orderedSpans.forEach((span) => {
                // Collapse all spans of the target type
                if (span.service === type) {
                    newCollapsed.add(span.span_id);
                }
            });
            
            setCollapsedSpans(newCollapsed);
            setCollapseToType(type);
        }
    };

    // Filter by mode functions
    const allTypes = ['spark-app', 'spark-sql', 'spark-job', 'spark-stage'];
    const allSelected = allTypes.every(type => visibleTypes.has(type));
    const noneSelected = allTypes.every(type => !visibleTypes.has(type));
    const someSelected = !allSelected && !noneSelected;

    const toggleType = (type: string) => {
        setVisibleTypes((prev) => {
            const next = new Set(prev);
            const isCurrentlyVisible = next.has(type);
            
            if (isCurrentlyVisible) {
                next.delete(type);
                // Remove collapsed state for this type when hiding it
                setCollapsedSpans((prevCollapsed) => {
                    const newCollapsed = new Set(prevCollapsed);
                    orderedSpans.forEach((span) => {
                        if (span.service === type) {
                            newCollapsed.delete(span.span_id);
                        }
                    });
                    return newCollapsed;
                });
            } else {
                next.add(type);
                // Collapse spans of this type when adding it
                setCollapsedSpans((prevCollapsed) => {
                    const newCollapsed = new Set(prevCollapsed);
                    orderedSpans.forEach((span) => {
                        if (span.service === type) {
                            newCollapsed.add(span.span_id);
                        }
                    });
                    return newCollapsed;
                });
            }
            return next;
        });
    };

    const selectOnly = (type: string) => {
        if (visibleTypes.size === 1 && visibleTypes.has(type)) {
            // Selecting "all" - expand everything
            setVisibleTypes(new Set(allTypes));
            setCollapsedSpans(new Set());
        } else {
            // Select only this type - collapse all of them
            setVisibleTypes(new Set([type]));
            const newCollapsed = new Set<string>();
            orderedSpans.forEach((span) => {
                if (span.service === type) {
                    newCollapsed.add(span.span_id);
                }
            });
            setCollapsedSpans(newCollapsed);
        }
    };

    const toggleAll = () => {
        if (allSelected) {
            setVisibleTypes(new Set());
            setCollapsedSpans(new Set());
        } else {
            setVisibleTypes(new Set(allTypes));
            setCollapsedSpans(new Set());
        }
    };

    // Ghost mode functions
    const toggleGhostReveal = (spanId: string) => {
        setRevealedGhostSpans((prev) => {
            const next = new Set(prev);
            if (next.has(spanId)) {
                next.delete(spanId);
            } else {
                next.add(spanId);
            }
            return next;
        });
    };

    const setGhostFilter = (type: string) => {
        setGhostVisibleTypes(new Set([type]));
        setRevealedGhostSpans(new Set()); // Reset revealed ghosts
    };

    // Smart mode functions
    const setSmartFilter = (type: string) => {
        setSmartVisibleType(type);
        setRevealedSmartSpans(new Set()); // Reset revealed spans
    };

    const countAncestors = (spanId: string): number => {
        let count = 0;
        let currentId = spanId;
        while (currentId !== '0') {
            const span = mockTraceTree.spans[currentId];
            if (!span || span.parent_id === '0') break;
            count++;
            currentId = span.parent_id;
        }
        return count;
    };

    const revealParent = (spanId: string) => {
        const span = mockTraceTree.spans[spanId];
        if (span && span.parent_id !== '0') {
            setRevealedSmartSpans((prev) => new Set(prev).add(span.parent_id));
            // Highlight both the child that clicked and the revealed parent
            setHighlightedSpans(new Set([spanId, span.parent_id]));
            setTimeout(() => setHighlightedSpans(new Set()), 1500);
        }
    };

    const revealChildren = (spanId: string) => {
        const span = mockTraceTree.spans[spanId];
        if (span && span.children_ids && span.children_ids.length > 0) {
            setRevealedSmartSpans((prev) => {
                const next = new Set(prev);
                span.children_ids.forEach((childId: string) => next.add(childId));
                return next;
            });
            // Expand and highlight the parent to show children
            setCollapsedSpans((prev) => {
                const next = new Set(prev);
                next.delete(span.span_id);
                return next;
            });
            // Highlight the parent and all revealed children
            setHighlightedSpans(new Set([spanId, ...span.children_ids]));
            setTimeout(() => setHighlightedSpans(new Set()), 1500);
        }
    };

    // Apply filtering based on mode
    const filteredSpans = React.useMemo(() => {
        if (prototypeMode === 'collapse') {
            // No filtering in collapse mode
            return orderedSpans;
        } else if (prototypeMode === 'ghost') {
            // Ghost mode: show filtered spans + ghost parents/children
            return orderedSpans; // Show all, but mark some as ghosts
        } else if (prototypeMode === 'smart') {
            // Smart mode: show only selected type + revealed spans
            return orderedSpans.filter((span) => 
                span.service === smartVisibleType || revealedSmartSpans.has(span.span_id)
            );
        } else {
            // Filter mode: show children of visible expanded parents
            const visibleSpanIds = new Set<string>();
            
            orderedSpans.forEach((span) => {
                if (visibleTypes.has(span.service)) {
                    visibleSpanIds.add(span.span_id);
                }
            });
            
            orderedSpans.forEach((span) => {
                if (span.parent_id !== '0') {
                    if (visibleSpanIds.has(span.parent_id) && !collapsedSpans.has(span.parent_id)) {
                        visibleSpanIds.add(span.span_id);
                    }
                }
            });
            
            return orderedSpans.filter((span) => visibleSpanIds.has(span.span_id));
        }
    }, [orderedSpans, prototypeMode, visibleTypes, collapsedSpans, smartVisibleType, revealedSmartSpans]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        if (!isFilterOpen) return;
        
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('[data-filter-menu]')) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isFilterOpen]);

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            {/* Prototype Switcher */}
            <div style={{ 
                display: 'flex', 
                gap: '8px',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #e0e0e0',
            }}>
                <button
                    onClick={() => setPrototypeMode('filter')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: prototypeMode === 'filter' ? 600 : 400,
                        color: prototypeMode === 'filter' ? '#000' : '#666',
                        background: prototypeMode === 'filter' ? '#f5f5f5' : 'transparent',
                        border: '1px solid',
                        borderColor: prototypeMode === 'filter' ? '#ddd' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    Filter by
                </button>
                <button
                    onClick={() => setPrototypeMode('collapse')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: prototypeMode === 'collapse' ? 600 : 400,
                        color: prototypeMode === 'collapse' ? '#000' : '#666',
                        background: prototypeMode === 'collapse' ? '#f5f5f5' : 'transparent',
                        border: '1px solid',
                        borderColor: prototypeMode === 'collapse' ? '#ddd' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    Collapse to
                </button>
                <button
                    onClick={() => setPrototypeMode('ghost')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: prototypeMode === 'ghost' ? 600 : 400,
                        color: prototypeMode === 'ghost' ? '#000' : '#666',
                        background: prototypeMode === 'ghost' ? '#f5f5f5' : 'transparent',
                        border: '1px solid',
                        borderColor: prototypeMode === 'ghost' ? '#ddd' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    Ghost spans
                </button>
                <button
                    onClick={() => setPrototypeMode('smart')}
                    style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: prototypeMode === 'smart' ? 600 : 400,
                        color: prototypeMode === 'smart' ? '#000' : '#666',
                        background: prototypeMode === 'smart' ? '#f5f5f5' : 'transparent',
                        border: '1px solid',
                        borderColor: prototypeMode === 'smart' ? '#ddd' : 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    Smart reveal
                </button>
            </div>

            {/* Filter Button - Above the waterfall */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                marginBottom: '16px',
                position: 'relative',
            }}>
                <div 
                    data-filter-menu
                    style={{ position: 'relative' }}
                >
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#666';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#999';
                        }}
                    >
                        <SlidersIcon />
                    </button>

                    {/* Dropdown */}
                    {isFilterOpen && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '40px',
                                right: '0',
                                background: 'white',
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                padding: '8px 0',
                                minWidth: '180px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                zIndex: 100,
                            }}
                        >
                            {prototypeMode === 'smart' ? (
                                <>
                                    <div style={{ padding: '8px 12px 4px 12px', fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>
                                        Focus on
                                    </div>

                                    {/* Smart Filter Options */}
                                    {[
                                        { key: 'spark-app', label: 'App' },
                                        { key: 'spark-sql', label: 'SQL' },
                                        { key: 'spark-job', label: 'Job' },
                                        { key: 'spark-stage', label: 'Stage' },
                                    ].map(({ key, label }) => (
                                        <div
                                            key={key}
                                            onClick={() => setSmartFilter(key)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                backgroundColor: hoveredFilterItem === key ? '#f5f5f5' : 'transparent',
                                            }}
                                            onMouseEnter={() => setHoveredFilterItem(key)}
                                            onMouseLeave={() => setHoveredFilterItem(null)}
                                        >
                                            <span style={{ fontWeight: smartVisibleType === key ? 600 : 400 }}>
                                                {smartVisibleType === key && '✓ '}{label}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            ) : prototypeMode === 'ghost' ? (
                                <>
                                    <div style={{ padding: '8px 12px 4px 12px', fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>
                                        Focus on
                                    </div>

                                    {/* Ghost Filter Options */}
                                    {[
                                        { key: 'spark-app', label: 'App' },
                                        { key: 'spark-sql', label: 'SQL' },
                                        { key: 'spark-job', label: 'Job' },
                                        { key: 'spark-stage', label: 'Stage' },
                                    ].map(({ key, label }) => (
                                        <div
                                            key={key}
                                            onClick={() => setGhostFilter(key)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                backgroundColor: hoveredFilterItem === key ? '#f5f5f5' : 'transparent',
                                            }}
                                            onMouseEnter={() => setHoveredFilterItem(key)}
                                            onMouseLeave={() => setHoveredFilterItem(null)}
                                        >
                                            <span style={{ fontWeight: ghostVisibleTypes.has(key) ? 600 : 400 }}>
                                                {ghostVisibleTypes.has(key) && '✓ '}{label}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            ) : prototypeMode === 'collapse' ? (
                                <>
                                    <div style={{ padding: '8px 12px 4px 12px', fontSize: '11px', fontWeight: 600, color: '#999', textTransform: 'uppercase' }}>
                                        Collapse to
                                    </div>

                                    {/* Expand All Option */}
                                    <div
                                        onClick={() => applyCollapseTo(null)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            backgroundColor: hoveredFilterItem === 'none' ? '#f5f5f5' : 'transparent',
                                        }}
                                        onMouseEnter={() => setHoveredFilterItem('none')}
                                        onMouseLeave={() => setHoveredFilterItem(null)}
                                    >
                                        <span style={{ fontWeight: collapseToType === null ? 600 : 400 }}>
                                            {collapseToType === null && '✓ '}Expand All
                                        </span>
                                    </div>

                                    {/* Collapse To Options */}
                                    {[
                                        { key: 'spark-app', label: 'App' },
                                        { key: 'spark-sql', label: 'SQL' },
                                        { key: 'spark-job', label: 'Job' },
                                        { key: 'spark-stage', label: 'Stage' },
                                    ].map(({ key, label }) => (
                                        <div
                                            key={key}
                                            onClick={() => applyCollapseTo(key)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                backgroundColor: hoveredFilterItem === key ? '#f5f5f5' : 'transparent',
                                            }}
                                            onMouseEnter={() => setHoveredFilterItem(key)}
                                            onMouseLeave={() => setHoveredFilterItem(null)}
                                        >
                                            <span style={{ fontWeight: collapseToType === key ? 600 : 400 }}>
                                                {collapseToType === key && '✓ '}{label}
                                            </span>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {/* All Option */}
                                    <div
                                        onClick={toggleAll}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            borderBottom: '1px solid #e0e0e0',
                                            marginBottom: '4px',
                                            backgroundColor: hoveredFilterItem === 'all' ? '#f5f5f5' : 'transparent',
                                        }}
                                        onMouseEnter={() => setHoveredFilterItem('all')}
                                        onMouseLeave={() => setHoveredFilterItem(null)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                ref={(input) => {
                                                    if (input) {
                                                        input.indeterminate = someSelected;
                                                    }
                                                }}
                                                onChange={toggleAll}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            <span style={{ fontWeight: 600 }}>All</span>
                                        </div>
                                        {hoveredFilterItem === 'all' && (
                                            <span style={{ color: '#999', fontSize: '12px' }}>
                                                {allSelected ? 'Uncheck All' : 'Check All'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Individual Filter Options */}
                                    {[
                                        { key: 'spark-app', label: 'App' },
                                        { key: 'spark-sql', label: 'SQL' },
                                        { key: 'spark-job', label: 'Job' },
                                        { key: 'spark-stage', label: 'Stage' },
                                    ].map(({ key, label }) => (
                                        <div
                                            key={key}
                                            onClick={() => selectOnly(key)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 12px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                backgroundColor: (hoveredFilterItem === key || hoveredFilterItem === `${key}-checkbox`) ? '#f5f5f5' : 'transparent',
                                            }}
                                            onMouseEnter={() => setHoveredFilterItem(key)}
                                            onMouseLeave={() => setHoveredFilterItem(null)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={visibleTypes.has(key)}
                                                    onChange={() => toggleType(key)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseEnter={(e) => {
                                                        e.stopPropagation();
                                                        setHoveredFilterItem(`${key}-checkbox`);
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.stopPropagation();
                                                        setHoveredFilterItem(key);
                                                    }}
                                                    style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                                <span>{label}</span>
                                            </div>
                                            {hoveredFilterItem === key && (
                                                <span style={{ color: '#999', fontSize: '12px' }}>
                                                    {visibleTypes.size === 1 && visibleTypes.has(key) ? 'Check All' : 'Only'}
                                                </span>
                                            )}
                                            {hoveredFilterItem === `${key}-checkbox` && (
                                                <span style={{ color: '#999', fontSize: '12px' }}>
                                                    {visibleTypes.has(key) ? 'Uncheck' : 'Check'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div
                style={{
                    overflow: 'hidden',
                    flex: 1,
                    minHeight: '600px',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'auto',
                    }}
                >
                    {/* Spans */}
                    {filteredSpans.map((span) => {
                        const isGhost = prototypeMode === 'ghost' && 
                                       !ghostVisibleTypes.has(span.service) && 
                                       !revealedGhostSpans.has(span.span_id);
                        
                        // Smart mode indicators
                        // Show badges for: selected type OR revealed spans
                        const isSmartRelevant = prototypeMode === 'smart' && 
                                               (span.service === smartVisibleType || revealedSmartSpans.has(span.span_id));
                        
                        const ancestorCount = isSmartRelevant 
                                             ? countAncestors(span.span_id) 
                                             : 0;
                        
                        const hasHiddenParent = isSmartRelevant &&
                                               span.parent_id !== '0' && 
                                               !revealedSmartSpans.has(span.parent_id);
                        
                        const hiddenChildrenCount = isSmartRelevant &&
                                                   span.children_ids 
                                                   ? span.children_ids.filter((id: string) => !revealedSmartSpans.has(id)).length 
                                                   : 0;
                        
                        const hasHiddenChildren = hiddenChildrenCount > 0;
                        
                        const isHighlighted = highlightedSpans.has(span.span_id);
                        
                        return (
                            <WaterfallSpanRow
                                key={span.span_id}
                                span={span}
                                traceStart={traceStart}
                                traceEnd={traceEnd}
                                selected={false}
                                hovered={span.span_id === hoveredSpanId}
                                highlighted={isHighlighted}
                                isCollapsed={collapsedSpans.has(span.span_id)}
                                hasChildren={
                                    span.children_ids &&
                                    span.children_ids.length > 0
                                }
                                onToggle={() => {
                                    if (isGhost) {
                                        toggleGhostReveal(span.span_id);
                                    } else {
                                        toggleCollapse(span.span_id);
                                    }
                                }}
                                onHover={() =>
                                    setHoveredSpanId(span.span_id)
                                }
                                onLeave={() => setHoveredSpanId(null)}
                                isGhost={isGhost}
                                hasHiddenParent={hasHiddenParent}
                                hasHiddenChildren={hasHiddenChildren}
                                ancestorCount={ancestorCount}
                                hiddenChildrenCount={hiddenChildrenCount}
                                onRevealParent={() => revealParent(span.span_id)}
                                onRevealChildren={() => revealChildren(span.span_id)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default TraceWaterfall;

